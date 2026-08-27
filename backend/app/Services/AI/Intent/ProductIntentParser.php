<?php

declare(strict_types=1);

namespace App\Services\AI\Intent;

use App\Models\Product;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ProductIntentParser
{
    /**
     * Parse a customer message into deterministic product intent.
     */
    public function parse(string $message): array
    {
        return $this->parseIntent($message);
    }

    /**
     * Check whether a product belongs to a canonical brand.
     */
    public function matchesBrand(Product $product, string $brand): bool
    {
        return $this->productMatchesBrand($product, $brand);
    }

    /**
     * Normalize customer text using the parser's canonical rules.
     */
    public function normalize(string $text): string
    {
        return $this->normalizeText($text);
    }

    /**
     * Perform complete-word matching using parser rules.
     */
    public function containsWord(string $haystack, string $needle): bool
    {
        return $this->textContainsWord($haystack, $needle);
    }

/**
     * Centralized category dictionary.
     */
    protected function categoryDefinitions(): array
    {
        return [
            'home-appliances' => [
                'home appliances',
                'home appliance',
                'air conditioner',
                'air conditioning',
                'air purifier',
                'air fryer',
                'appliance',
                'appliances',
            ],

            'study-materials' => [
                'study materials',
                'study material',
                'study guides',
                'study guide',
                'learning materials',
                'learning material',
                'course materials',
                'course material',
                'textbooks',
                'textbook',
                'books',
                'book',
            ],

            'smartphone' => [
                'smartphones',
                'smartphone',
                'mobile phones',
                'mobile phone',
                'cell phones',
                'cell phone',
                'mobiles',
                'mobile',
                'phones',
                'phone',
            ],

            'motherboard' => [
                'motherboards',
                'motherboard',
                'mainboards',
                'mainboard',
            ],

            'laptop' => [
                'laptops',
                'laptop',
                'notebooks',
                'notebook',
                'portable computer',
                'portable computers',
            ],
        ];
    }

    /**
     * Brand/product-family aliases.
     *
     * These are deliberately kept small and reviewable.
     *
     * Phase 2 will move broader semantic product understanding
     * into AI-generated product enrichment / ai_tags.
     */


    protected function brandAliases(): array
    {
        return [
            'apple' => [
                'apple',
                'mac',
                'macbook',
                'iphone',
                'ipad',
                'imac',
                'airpods',
            ],

            'hp' => [
                'hp',
                'hewlett packard',
                'hewlett-packard',
            ],

            'lenovo' => [
                'lenovo',
                'thinkpad',
                'ideapad',
                'yoga',
            ],

            'dell' => [
                'dell',
                'inspiron',
                'latitude',
                'xps',
                'alienware',
            ],

            'asus' => [
                'asus',
                'vivobook',
                'zenbook',
                'rog',
                'tuf',
            ],

            'acer' => [
                'acer',
                'aspire',
                'predator',
                'nitro',
            ],

            'samsung' => [
                'samsung',
                'galaxy',
            ],

            'niako' => [
                'niako',
            ],
        ];
    }
    /**
     * Canonical product feature aliases.
     *
     * These represent factual product attributes that can safely
     * participate in hard retrieval constraints.
     */
    protected function featureAliases(): array
    {
        return [
            'wifi' => [
                'wifi',
                'wi fi',
            ],

            'bluetooth' => [
                'bluetooth',
                'blue tooth',
            ],

            'touchscreen' => [
                'touchscreen',
                'touch screen',
            ],

            '5g' => [
                '5g',
            ],

            '4g' => [
                '4g',
            ],
        ];
    }
    /**
     * Detect explicit negative feature requirements.
     *
     * Examples:
     *
     * "no wifi"
     * "without wifi"
     * "non wifi"
     * "non-wifi"
     * "wifi less"
     * "wifi-less"
     * "wifi free"
     * "wifi-free"
     * "excluding wifi"
     * "exclude wifi"
     * "doesn't have wifi"
     * "does not have wifi"
     * "do not have wifi"
     * "not having wifi"
     * "lacks wifi"
     *
     * Unknown features are not converted into structured constraints.
     */

    /**
 * Check whether a feature occurrence is explicitly negated.
    */
    protected function isFeatureNegated(
        string $text,
        string $alias
    ): bool {
        $escapedAlias = preg_quote($alias, '/');

        $patterns = [
            '/\bno\s+' . $escapedAlias . '\b/u',
            '/\bwithout\s+' . $escapedAlias . '\b/u',
            '/\bnon[\s-]+' . $escapedAlias . '\b/u',
            '/\b' . $escapedAlias . '[\s-]+less\b/u',
            '/\b' . $escapedAlias . '[\s-]+free\b/u',
            '/\bexcluding\s+' . $escapedAlias . '\b/u',
            '/\bexclude\s+' . $escapedAlias . '\b/u',
            '/\bdoesn(?:\'t|t)\s+have\s+' . $escapedAlias . '\b/u',
            '/\bdoes\s+not\s+have\s+' . $escapedAlias . '\b/u',
            '/\bdo\s+not\s+have\s+' . $escapedAlias . '\b/u',
            '/\bnot\s+having\s+' . $escapedAlias . '\b/u',
            '/\blacks\s+' . $escapedAlias . '\b/u',
            '/\black\s+' . $escapedAlias . '\b/u',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $text)) {
                return true;
            }
        }

        return false;
    }
    protected function extractExcludeFeatures(
        string $text
    ): Collection {
        $features = collect();

        foreach ($this->featureAliases() as $feature => $aliases) {
            foreach ($aliases as $alias) {
                $escapedAlias = preg_quote($alias, '/');

                $patterns = [
                    '/\bno\s+' . $escapedAlias . '\b/u',
                    '/\bwithout\s+' . $escapedAlias . '\b/u',
                    '/\bnon[\s-]+' . $escapedAlias . '\b/u',
                    '/\b' . $escapedAlias . '[\s-]+less\b/u',
                    '/\b' . $escapedAlias . '[\s-]+free\b/u',
                    '/\bexcluding\s+' . $escapedAlias . '\b/u',
                    '/\bexclude\s+' . $escapedAlias . '\b/u',
                    '/\bdoesn(?:\'t|t)\s+have\s+' . $escapedAlias . '\b/u',
                    '/\bdoes\s+not\s+have\s+' . $escapedAlias . '\b/u',
                    '/\bdo\s+not\s+have\s+' . $escapedAlias . '\b/u',
                    '/\bnot\s+having\s+' . $escapedAlias . '\b/u',
                    '/\blacks\s+' . $escapedAlias . '\b/u',
                    '/\black\s+' . $escapedAlias . '\b/u',
                ];

                foreach ($patterns as $pattern) {
                    if (preg_match($pattern, $text)) {
                        $features->push([
                            'key' => $feature,
                            'value' => false,
                        ]);

                        break;
                    }
                }
            }
        }

        return $features
            ->unique(
                fn (array $feature) =>
                    $feature['key'] . ':' . $feature['value']
            )
            ->values();
    }


    /**
     * Detect explicit positive feature requirements.
     *
     * Examples:
     * - "with wifi"
     * - "with bluetooth"
     * - "has bluetooth"
     * - "supports bluetooth"
     * - "bluetooth motherboard"
     */
    



    protected function textContainsWord(
        string $haystack,
        string $needle
    ): bool {
        $haystack = Str::lower(trim($haystack));
        $needle = Str::lower(trim($needle));

        if ($haystack === '' || $needle === '') {
            return false;
        }

        return (bool) preg_match(
            '/(?<![\pL\pN])' .
            preg_quote($needle, '/') .
            '(?![\pL\pN])/u',
            $haystack
        );
    }

    /**
     * Match a keyword against text while allowing common English
     * singular/plural variants.
     *
     * Examples:
     *
     * "student" matches "student" and "students"
     * "laptop" matches "laptop" and "laptops"
     * "game" matches "game" and "games"
     *
     * Exact matching is always preferred.
     */
    public function containsKeyword(string $haystack, string $keyword): bool
    {
        if ($this->textContainsWord($haystack, $keyword)) {
            return true;
        }

        $keyword = Str::lower(trim($keyword));

        if ($keyword === '') {
            return false;
        }

        $variants = [
            $keyword . 's',
            $keyword . 'es',
        ];

        /*
         * Common consonant + y pluralization:
         *
         * university -> universities
         * category   -> categories
         */
        if (
            Str::length($keyword) > 1 &&
            Str::endsWith($keyword, 'y') &&
            !in_array(
                Str::substr($keyword, -2, 1),
                ['a', 'e', 'i', 'o', 'u'],
                true
            )
        ) {
            $variants[] =
                Str::substr($keyword, 0, -1) . 'ies';
        }

        foreach (array_unique($variants) as $variant) {
            if ($this->textContainsWord($haystack, $variant)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Detect a canonical brand from customer text.
     */
    protected function detectBrand(string $normalizedText): ?string
    {
        foreach ($this->brandAliases() as $brand => $aliases) {
            foreach ($aliases as $alias) {
                if ($this->textContainsWord($normalizedText, $alias)) {
                    return $brand;
                }
            }
        }

        return null;
    }

    /**
     * Determine whether a product belongs to the requested brand.
     *
     * Product name and SKU are used as deterministic sources.
     *
     * We intentionally do not use a loose SQL LIKE "%brand%"
     * because short brands such as "hp" can create false matches.
     */
    protected function productMatchesBrand(
        Product $product,
        string $brand
    ): bool {
        $aliases = $this->brandAliases()[$brand] ?? [];

        if (empty($aliases)) {
            return false;
        }

        $name = (string) $product->name;
        $sku = (string) $product->sku;

        foreach ($aliases as $alias) {
            if (
                $this->textContainsWord($name, $alias) ||
                $this->textContainsWord($sku, $alias)
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Tokens extracted from all category aliases to prevent filtering out
     * category synonyms.
     */
    protected function categoryAliasTokens(): Collection
    {
        $tokens = collect();

        foreach ($this->categoryDefinitions() as $aliases) {
            foreach ($aliases as $alias) {
                foreach (preg_split('/\s+/', $alias) as $word) {
                    $word = Str::lower(trim($word));

                    if ($word !== '') {
                        $tokens->push($word);
                    }
                }
            }
        }

        return $tokens
            ->unique()
            ->values();
    }

    /**
     * Tokens extracted from brand aliases.
     *
     * These are removed from generic keyword filtering because brand
     * matching is handled separately as a hard constraint.
     */
    protected function brandAliasTokens(): Collection
    {
        $tokens = collect();

        foreach ($this->brandAliases() as $aliases) {
            foreach ($aliases as $alias) {
                foreach (preg_split('/\s+/', $alias) as $word) {
                    $word = Str::lower(trim($word));

                    if ($word !== '') {
                        $tokens->push($word);
                    }
                }
            }
        }

        return $tokens
            ->unique()
            ->values();
    }

    /**
     * Parse customer requirements deterministically.
     */
    protected function parseIntent(string $message): array
    {
        $normalized = $this->normalizeText($message);

        $keywords = $this->extractKeywords($normalized);

        /*
         * Preserve meaningful multi-word product phrases.
         *
         * Examples:
         * - air purifier
         * - air conditioner
         * - air fryer
         * - gaming laptop
         */
        $phrases = $this->extractProductPhrases($normalized);

        $categoryTokens = $this->categoryAliasTokens();
        $brandTokens = $this->brandAliasTokens();

        $category = $this->detectCategory($normalized);
        $brand = $this->detectBrand($normalized);

        /*
         * Explicit negative requirements.
         *
         * Example:
         * "motherboard no wifi"
         *
         * becomes:
         * exclude_keywords = ["wifi"]
         */
        /*
        * Explicit negative requirements.
        *
        * Known factual features such as wifi, bluetooth,
        * touchscreen, 4g and 5g are handled separately as
        * structured hard constraints.
        */
        $excludeFeatures = $this->extractExcludeFeatures($normalized);
        $requiredFeatures = $this->extractRequiredFeatures($normalized);

        /*
        * Generic negative keywords remain conservative.
        *
        * Remove known feature exclusions from the generic list
        * so "no wifi" does not become a generic keyword filter.
        */
        $excludeKeywords = collect();

        $negativePatterns = [
            '/\bno\s+([\pL\pN]+)\b/u',
            '/\bwithout\s+([\pL\pN]+)\b/u',
            '/\bexcluding\s+([\pL\pN]+)\b/u',
            '/\bexclude\s+([\pL\pN]+)\b/u',
        ];

        foreach ($negativePatterns as $pattern) {
            if (!preg_match_all($pattern, $normalized, $matches)) {
                continue;
            }

            foreach ($matches[1] as $keyword) {
                $keyword = Str::lower(trim($keyword));

                if ($keyword !== '') {
                    $excludeKeywords->push($keyword);
                }
            }
        }

        $excludeKeywords = $excludeKeywords
            ->reject(
                fn (string $keyword) =>
                    $excludeFeatures->contains(
                        fn (array $feature) =>
                            $this->containsKeyword(
                                $keyword,
                                $feature['key']
                            )
                    )
            )
            ->unique()
            ->values();

        /*
         * Remove category and brand terms from generic filtering.
         * They are already handled as structured constraints.
         *
         * Also remove explicit negative keywords from positive filters.
         */
        $filterKeywords = $keywords
            ->reject(
                fn (string $word) =>
                    $categoryTokens->contains($word)
            )
            ->reject(
                fn (string $word) =>
                    $brandTokens->contains($word)
            )
            ->reject(
                fn (string $word) =>
                    $excludeKeywords->contains($word)
            )
            ->reject(
                fn (string $word) =>
                    $excludeFeatures->contains(
                        fn (array $feature) =>
                            $this->containsKeyword(
                                $word,
                                $feature['key']
                            )
                    )
            )
            ->values();

        /*
         * Hard product phrases.
         *
         * These phrases identify a concrete product type and therefore
         * may safely participate in hard retrieval filtering.
         *
         * Semantic/use-case phrases such as "gaming laptop",
         * "programming laptop", and "student laptop" remain ranking
         * signals instead of hard filters.
         */
        $hardPhraseDefinitions = [
            'air purifier',
            'air conditioner',
            'air fryer',
        ];

        $hardPhrases = collect($hardPhraseDefinitions)
            ->filter(
                fn (string $phrase) =>
                    $this->textContainsWord($normalized, $phrase)
            )
            ->values();

        /*
         * Use-case intent.
         *
         * These are deterministic semantic hints for the scorer.
         * They are intentionally small and reviewable.
         */
        $useCase = null;

        $useCaseDefinitions = [
            'gaming' => [
                'gaming',
                'game',
                'games',
            ],

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

        foreach ($useCaseDefinitions as $canonical => $aliases) {
            foreach ($aliases as $alias) {
                if ($this->textContainsWord($normalized, $alias)) {
                    $useCase = $canonical;
                    break 2;
                }
            }
        }

        return [
            'category' => $category,
            'brand' => $brand,
            'max_price' => $this->extractMaxPrice($normalized),
            'min_price' => $this->extractMinPrice($normalized),
            'keywords' => $keywords,
            'phrases' => $phrases,
            'hard_phrases' => $hardPhrases,
            'filter_keywords' => $filterKeywords,
            'exclude_keywords' => $excludeKeywords,
            'exclude_features' => $excludeFeatures,
            'required_features' => $requiredFeatures,
            'use_case' => $useCase,
            'original' => trim($message),
        ];
    }

    /**
 * Extract explicit positive product feature requirements.
 *
 * Examples:
 *
 * "motherboard with wifi"
 *     -> [
 *          ['key' => 'wifi', 'value' => true]
 *        ]
 *
 * "motherboard with bluetooth"
 *     -> [
 *          ['key' => 'bluetooth', 'value' => true]
 *        ]
 *
 * Only explicitly requested positive features are returned.
 * Missing/unknown features must NOT be inferred.
    */
    protected function extractRequiredFeatures(
        string $text
    ): Collection {
        $features = collect();

        /*
        * Only accept known factual features.
        *
        * The actual aliases come from featureAliases().
        */
        foreach ($this->featureAliases() as $feature => $aliases) {
            foreach ($aliases as $alias) {
                if (
                    $this->textContainsWord($text, $alias) &&
                    !$this->isFeatureNegated($text, $alias)
                ) {
                    /*
                    * Only treat the feature as a hard requirement when
                    * it is explicitly expressed as a positive requirement.
                    *
                    * Examples:
                    *
                    * "with wifi"
                    * "has wifi"
                    * "having wifi"
                    * "wifi motherboard"
                    * "motherboard wifi"
                    */
                    $positivePatterns = [
                        '/\bwith\s+' . preg_quote($alias, '/') . '\b/u',
                        '/\bhas\s+' . preg_quote($alias, '/') . '\b/u',
                        '/\bhave\s+' . preg_quote($alias, '/') . '\b/u',
                        '/\bhaving\s+' . preg_quote($alias, '/') . '\b/u',
                        '/\brequires?\s+' . preg_quote($alias, '/') . '\b/u',
                        '/\bneed(?:s)?\s+' . preg_quote($alias, '/') . '\b/u',
                        '/\b' . preg_quote($alias, '/') . '\s+motherboard\b/u',
                        '/\bmotherboard\s+' . preg_quote($alias, '/') . '\b/u',
                    ];

                    foreach ($positivePatterns as $pattern) {
                        if (preg_match($pattern, $text)) {
                            $features->push([
                                'key' => $feature,
                                'value' => true,
                            ]);

                            break;
                        }
                    }
                }
            }
        }

        return $features
            ->unique(
                fn (array $feature) =>
                    $feature['key'] . ':' . json_encode($feature['value'])
            )
            ->values();
    }
        /**
         * Normalize text.
         */
        protected function normalizeText(string $text): string
        {
            $text = Str::lower(trim($text));

            $text = str_replace(
                [
                    '৳',
                    'টাকা',
                    'taka',
                    'bdt',
                ],
                ' ',
                $text
            );

            $text = preg_replace_callback(
                '/\b(\d+(?:\.\d+)?)\s*(k|thousand|lakh|lac)\b/i',
                function (array $matches): string {
                    $number = (float) $matches[1];
                    $unit = Str::lower($matches[2]);

                    $value = match ($unit) {
                        'k',
                        'thousand' => $number * 1000,

                        'lakh',
                        'lac' => $number * 100000,

                        default => $number,
                    };

                    return (string) $value;
                },
                $text
            );

            $text = preg_replace(
                '/[^\pL\pN]+/u',
                ' ',
                $text
            );

            return trim(
                preg_replace('/\s+/', ' ', $text)
            );
        }

        /**
         * Detect canonical product category.
         *
         * Uses complete-word matching rather than raw substring matching.
         *
         * Therefore:
         *
         * "macbook"
         *
         * cannot accidentally match:
         *
         * "book"
         */
        protected function detectCategory(string $text): ?string
    {
        $definitions = $this->categoryDefinitions();

        foreach ($definitions as $slug => $aliases) {
            usort(
                $aliases,
                fn (string $a, string $b) =>
                    strlen($b) <=> strlen($a)
            );

            foreach ($aliases as $alias) {
                if ($this->textContainsWord($text, $alias)) {
                    return $slug;
                }
            }
        }

        return null;
    }

    /**
     * Extract maximum price.
     */
    protected function extractMaxPrice(string $text): ?float
    {
        $patterns = [
            '/\b(?:under|below|less than|maximum|max|within|up to|upto)\s+(\d+(?:\.\d+)?)\b/i',
            '/\bprice\s+(?:under|below|less than)\s+(\d+(?:\.\d+)?)\b/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                return (float) $matches[1];
            }
        }

        return null;
    }

    /**
     * Extract minimum price.
     */
    protected function extractMinPrice(string $text): ?float
    {
        $patterns = [
            '/\b(?:above|over|more than|minimum|min)\s+(\d+(?:\.\d+)?)\b/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                return (float) $matches[1];
            }
        }

        return null;
    }

    /**
     * Extract explicit negative product requirements.
     *
     * Examples:
     *
     * "no wifi"       -> ["wifi"]
     * "without wifi" -> ["wifi"]
     * "no 5g"         -> ["5g"]
     *
     * Only complete words are captured.
     */
    /**
     * Extract explicit negative generic product requirements.
     *
     * Known factual features such as wifi, bluetooth, 5g, etc.
     * are handled separately by extractExcludeFeatures().
     */
    protected function extractExcludeKeywords(
        string $text
    ): Collection {
        $keywords = collect();

        $patterns = [
            '/\bno\s+([\pL\pN]+)\b/u',
            '/\bwithout\s+([\pL\pN]+)\b/u',
            '/\bexcluding\s+([\pL\pN]+)\b/u',
            '/\bexclude\s+([\pL\pN]+)\b/u',
        ];

        foreach ($patterns as $pattern) {
            if (!preg_match_all($pattern, $text, $matches)) {
                continue;
            }

            foreach ($matches[1] as $keyword) {
                $keyword = Str::lower(trim($keyword));

                if ($keyword !== '') {
                    $keywords->push($keyword);
                }
            }
        }

        return $keywords
            ->filter()
            ->unique()
            ->values();
    }
    /**
     * Extract meaningful multi-word product phrases.
     *
     * These phrases are ranking signals, not hard constraints.
     */
    protected function extractProductPhrases(string $text): Collection
    {
        $knownPhrases = [
            'air purifier',
            'air conditioner',
            'air fryer',
            'gaming laptop',
            'programming laptop',
            'student laptop',
            'business laptop',
            'office laptop',
            'mobile phone',
            'smart phone',
            'study material',
            'study materials',
            'motherboard wifi',
            'wifi motherboard',
        ];

        return collect($knownPhrases)
            ->filter(
                fn (string $phrase) =>
                    $this->textContainsWord($text, $phrase)
            )
            ->values();
    }

    /**
     * Extract useful search terms.
     */
    protected function extractKeywords(string $text): Collection
    {
        $stopWords = [
            'the',
            'and',
            'for',
            'with',
            'that',
            'this',
            'from',
            'have',
            'has',
            'need',
            'needs',
            'want',
            'wants',
            'looking',
            'look',
            'find',
            'show',
            'give',
            'some',
            'please',
            'good',
            'best',
            'better',
            'product',
            'products',
            'price',
            'budget',
            'under',
            'below',
            'less',
            'than',
            'maximum',
            'minimum',
            'within',
            
            // Negative requirement grammar
            'no',
            'without',
            'non',
            'exclude',
            'does',
            'not',
            'have',
            'having',
            'lacks',
            
            'available',
            'something',
            'anything',
            'currently',
            'would',
            'like',
            'recommend',
            'recommendation',
            'can',
            'you',
            'could',
            'me',
            'my',
            'i',
            'am',
            'a',
            'an',
            'to',
            'of',
            'in',
            'on',
            'is',
            'it',
            'be',
            'which',
        ];


        return collect(
            preg_split('/\s+/', $text)
        )
            ->map(
                fn (?string $word) =>
                    trim((string) $word)
            )
            ->filter(
                fn (string $word) =>
                    strlen($word) >= 3
            )
            ->reject(
                fn (string $word) =>
                    in_array($word, $stopWords, true)
            )
            ->filter(
                fn (string $word) =>
                    !is_numeric($word)
            )
            ->unique()
            ->values();
    }

    
}
