<?php

declare(strict_types=1);

namespace App\Services\AI\Retrieval;

use App\Models\Product;
use App\Services\AI\Intent\ProductIntentParser;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ProductKeywordScorer
{
    public function __construct(
        private readonly ProductIntentParser $intentParser,
    ) {
    }

    /**
     * Calculate deterministic relevance for a product.
     *
     * This scorer knows nothing about database filtering.
     * It only answers:
     *
     * "How relevant is this product to this request?"
     */
    public function score(
        Product $product,
        string $message,
        array $intent
    ): int {
        $score = 0;

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

        /*
         * Category is already a hard constraint.
         */
        if ($intent['category']) {
            $score += 100;

            if (
                $product->category?->slug ===
                $intent['category']
            ) {
                $score += 50;
            }
        }

        /*
         * Brand is already a hard constraint.
         */
        if (!empty($intent['brand'])) {
            if (
                $this->intentParser->matchesBrand(
                    $product,
                    $intent['brand']
                )
            ) {
                $score += 80;
            }
        }

        /*
         * Exact normalized phrase match.
         */
        $normalizedMessage = $this->intentParser->normalize(
            $message
        );

        if (
            $normalizedMessage !== '' &&
            $this->intentParser->containsWord(
                $name,
                $normalizedMessage
            )
        ) {
            $score += 50;
        }

        /*
         * Multi-word product phrase scoring.
         *
         * A phrase match is substantially stronger than
         * matching its individual words independently.
         *
         * Example:
         *
         * "air purifier"
         *
         * should strongly prefer:
         *
         * "Xiaomi Smart Air Purifier 4"
         *
         * over:
         *
         * "Philips Air Fryer"
         */
        foreach ($intent['phrases'] ?? [] as $phrase) {
            if (
                $this->intentParser->containsWord(
                    $name,
                    $phrase
                )
            ) {
                $score += 100;
            }

            if (
                $this->intentParser->containsWord(
                    $description,
                    $phrase
                )
            ) {
                $score += 50;
            }

            if (
                $this->intentParser->containsWord(
                    $category,
                    $phrase
                )
            ) {
                $score += 25;
            }

            if (
                $this->intentParser->containsWord(
                    $sku,
                    $phrase
                )
            ) {
                $score += 15;
            }
        }

        /*
         * Generic keyword scoring.
         */
        foreach ($intent['keywords'] as $keyword) {
            if (
                $this->intentParser->containsKeyword(
                    $name,
                    $keyword
                )
            ) {
                $score += 35;
            }

            if (
                $this->intentParser->containsKeyword(
                    $description,
                    $keyword
                )
            ) {
                $score += 20;
            }

            if (
                $this->intentParser->containsKeyword(
                    $category,
                    $keyword
                )
            ) {
                $score += 25;
            }

            if (
                $this->intentParser->containsKeyword(
                    $sku,
                    $keyword
                )
            ) {
                $score += 10;
            }
        }

        /*
         * Deterministic use-case matching.
         *
         * The parser identifies the requested use case.
         * Products receive additional relevance only when
         * their searchable text explicitly supports that use case.
         */
        $useCaseTerms = [
            'programming' => [
                'programming',
                'developer',
                'development',
                'coding',
                'software',
            ],

            'university' => [
                'university',
                'student',
                'study',
                'coursework',
                'education',
            ],

            'gaming' => [
                'gaming',
                'game',
                'games',
            ],

            'photography' => [
                'photography',
                'camera',
                'photo',
            ],

            'office' => [
                'office',
                'business',
                'productivity',
            ],
        ];

        $requestedUseCase = $intent['use_case'] ?? null;

        if (
            $requestedUseCase !== null &&
            isset($useCaseTerms[$requestedUseCase])
        ) {
            foreach ($useCaseTerms[$requestedUseCase] as $alias) {
                if (
                    $this->intentParser->containsWord(
                        $text,
                        $alias
                    )
                ) {
                    $score += 80;
                    break;
                }
            }
        }

        /*
         * Budget is a positive ranking signal.
         *
         * The actual price constraint is enforced separately.
         */
        if (
            $intent['max_price'] !== null &&
            (float) $product->price <=
            $intent['max_price']
        ) {
            $score += 10;
        }

        /*
         * Stock is eligibility, NOT relevance.
         */
        return $score;
    }

    /**
     * Score generic keyword matches.
     *
     * Used by the hard keyword filtering stage.
     */
    public function keywordMatchScore(
        Product $product,
        Collection $keywords
    ): int {
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

        $score = 0;

        foreach ($keywords as $keyword) {
            if (
                $this->intentParser->containsKeyword(
                    $name,
                    $keyword
                )
            ) {
                $score += 5;
            }

            if (
                $this->intentParser->containsKeyword(
                    $description,
                    $keyword
                )
            ) {
                $score += 2;
            }

            if (
                $this->intentParser->containsKeyword(
                    $category,
                    $keyword
                )
            ) {
                $score += 3;
            }

            if (
                $this->intentParser->containsKeyword(
                    $sku,
                    $keyword
                )
            ) {
                $score += 1;
            }
        }

        return $score;
    }
}
