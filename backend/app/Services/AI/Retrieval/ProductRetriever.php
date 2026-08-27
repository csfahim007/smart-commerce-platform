<?php

declare(strict_types=1);

namespace App\Services\AI\Retrieval;

use App\Models\Product;
use App\Services\AI\Intent\ProductIntentParser;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ProductRetriever
{
    public function __construct(
        private readonly ProductIntentParser $intentParser,
        private readonly ProductKeywordScorer $keywordScorer,
    ) {
    }

    /**
     * Retrieve and deterministically rank products.
     *
     * Hard business constraints:
     * - active products only
     * - stock must be greater than zero
     * - detected category
     * - detected price bounds
     * - detected brand
     * - explicit positive/negative feature requirements
     *
     * Keyword and use-case matching are ranking signals.
     */
    public function find(
        string $message,
        array $intent
    ): EloquentCollection {
        $query = Product::query()
            ->with([
                'category',
                'images',
            ])
            ->where('is_active', true)
            ->where('stock', '>', 0);

        /*
         * Category is a hard constraint whenever detected.
         */
        if ($intent['category']) {
            $query->whereHas(
                'category',
                function ($categoryQuery) use ($intent) {
                    $categoryQuery
                        ->where('slug', $intent['category'])
                        ->where('is_active', true);
                }
            );
        }

        /*
         * Price constraints are hard constraints.
         */
        if ($intent['max_price'] !== null) {
            $query->where(
                'price',
                '<=',
                $intent['max_price']
            );
        }

        if ($intent['min_price'] !== null) {
            $query->where(
                'price',
                '>=',
                $intent['min_price']
            );
        }

        /*
         * Fetch a bounded candidate set first.
         *
         * Brand filtering is intentionally performed in PHP using
         * complete-word matching rather than a loose SQL LIKE query.
         */
        $candidates = $query
            ->limit(100)
            ->get();

        /*
         * Brand is a hard constraint.
         */
        if (!empty($intent['brand'])) {
            $candidates = $candidates
                ->filter(
                    fn (Product $product) =>
                        $this->intentParser->matchesBrand(
                            $product,
                            $intent['brand']
                        )
                )
                ->values();
        }

        /*
         * Hard filter on explicit product-type phrases.
         *
         * Examples:
         * - "air purifier"
         * - "air conditioner"
         * - "air fryer"
         *
         * These require an exact searchable phrase match.
         */
        if (
            isset($intent['hard_phrases']) &&
            $intent['hard_phrases']->isNotEmpty()
        ) {
            $candidates = $candidates
                ->filter(function (Product $product) use ($intent) {
                    $name = Str::lower(
                        (string) $product->name
                    );

                    $description = Str::lower(
                        (string) $product->description
                    );

                    $category = Str::lower(
                        (string) ($product->category?->name ?? '')
                    );

                    $sku = Str::lower(
                        (string) $product->sku
                    );

                    $text =
                        $name .
                        ' ' .
                        $description .
                        ' ' .
                        $category .
                        ' ' .
                        $sku;

                    foreach ($intent['hard_phrases'] as $phrase) {
                        if (
                            $this->intentParser->containsWord(
                                $text,
                                $phrase
                            )
                        ) {
                            return true;
                        }
                    }

                    return false;
                })
                ->values();
        }

        /*
         * Hard filter on specific generic keywords beyond
         * category/brand.
         */
        if (
            isset($intent['filter_keywords']) &&
            $intent['filter_keywords']->isNotEmpty()
        ) {
            $candidates = $candidates
                ->filter(function (Product $product) use ($intent) {
                    return $this->keywordScorer->keywordMatchScore(
                        $product,
                        $intent['filter_keywords']
                    ) > 0;
                })
                ->values();
        }

        /*
         * Hard structured negative feature constraints.
         *
         * Example:
         *
         * "motherboard no wifi"
         *
         * requires:
         *
         * ai_tags.features.wifi === false
         *
         * IMPORTANT:
         *
         * Missing/unknown wifi does NOT satisfy "no wifi".
         */
        if (
            isset($intent['exclude_features']) &&
            $intent['exclude_features']->isNotEmpty()
        ) {
            $candidates = $candidates
                ->filter(
                    fn (Product $product) =>
                        $this->matchesExcludedFeatures(
                            $product,
                            $intent['exclude_features']
                        )
                )
                ->values();
        }

        /*
        * Hard filter on explicit positive feature requirements.
        *
        * Example:
        *
        * "motherboard with bluetooth"
        *
        * requires:
        *
        * ai_tags.features.bluetooth === true
        */
        if (
            isset($intent['required_features']) &&
            $intent['required_features']->isNotEmpty()
        ) {
            $candidates = $candidates
                ->filter(
                    fn (Product $product) =>
                        $this->matchesRequiredFeatures(
                            $product,
                            $intent['required_features']
                        )
                )
                ->values();
        }
        /*
         * Score every remaining candidate.
         */
        $scored = $candidates
            ->map(function (Product $product) use (
                $message,
                $intent
            ) {
                $score = $this->keywordScorer->score(
                    $product,
                    $message,
                    $intent
                );

                $product->assistant_relevance_score = $score;

                return $product;
            })
            ->filter(
                fn (Product $product) =>
                    $product->assistant_relevance_score > 0
            )
            ->sortByDesc(
                fn (Product $product) =>
                    $product->assistant_relevance_score
            )
            ->values();

        return $scored
            ->take(5)
            ->values();
    }

    /**
     * Check whether a product explicitly satisfies all
     * requested negative feature constraints.
     *
     * Example:
     *
     * exclude_features:
     * [
     *     ['key' => 'wifi', 'value' => false]
     * ]
     *
     * Product:
     *
     * ai_tags:
     * [
     *     'features' => [
     *         'wifi' => false,
     *     ],
     * ]
     *
     * => eligible
     *
     * Missing wifi:
     * => NOT eligible
     *
     * wifi = true:
     * => NOT eligible
     */
    protected function matchesExcludedFeatures(
        Product $product,
        Collection $excludeFeatures
    ): bool {
        $aiTags = is_array($product->ai_tags)
            ? $product->ai_tags
            : [];

        $features = is_array($aiTags['features'] ?? null)
            ? $aiTags['features']
            : [];

        foreach ($excludeFeatures as $feature) {
            $key = $feature['key'] ?? null;
            $requiredValue = $feature['value'] ?? null;

            if ($key === null) {
                return false;
            }

            /*
             * Unknown/missing feature does not satisfy
             * a negative requirement.
             */
            if (!array_key_exists($key, $features)) {
                return false;
            }

            if ($features[$key] !== $requiredValue) {
                return false;
            }
        }

        return true;
    }

    /**
 * Check whether a product explicitly satisfies all
 * requested positive feature constraints.
 *
 * Missing/unknown features do NOT satisfy the requirement.
 */
    protected function matchesRequiredFeatures(
        Product $product,
        Collection $requiredFeatures
    ): bool {
        $aiTags = is_array($product->ai_tags)
            ? $product->ai_tags
            : [];

        $features = is_array($aiTags['features'] ?? null)
            ? $aiTags['features']
            : [];

        foreach ($requiredFeatures as $feature) {
            $key = $feature['key'] ?? null;
            $requiredValue = $feature['value'] ?? null;

            if ($key === null) {
                return false;
            }

            /*
            * Unknown/missing feature does not satisfy
            * a positive requirement.
            */
            if (!array_key_exists($key, $features)) {
                return false;
            }

            if ($features[$key] !== $requiredValue) {
                return false;
            }
        }

        return true;
    }
}
