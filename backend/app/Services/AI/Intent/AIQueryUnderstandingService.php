<?php

declare(strict_types=1);

namespace App\Services\AI\Intent;

use App\Models\Category;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AIQueryUnderstandingService
{
    /**
     * Understand customer language using the current catalog
     * as the category boundary.
     *
     * AI does NOT select products.
     * AI only normalizes the customer's request into
     * searchable intent signals.
     */
    public function understand(
        string $message,
        array $deterministicIntent
    ): array {
        $categories = $this->catalogCategories();

        $apiKey = config('services.groq.api_key');
        $url = config('services.groq.url');
        $model = config('services.groq.model');

        if (!$apiKey || !$url || !$model) {
            return [];
        }

        $systemPrompt = <<<'PROMPT'
        You normalize customer product-search queries.

        Return ONLY JSON with this exact shape:

        {
        "normalized_query": "",
        "keywords": [],
        "phrases": []
        }

        Your task is to correct typos and understand obvious shopping-language
        synonyms.

        Examples:

        "programmig laptop"
        => {
        "normalized_query": "programming laptop",
        "keywords": ["programming", "laptop"],
        "phrases": ["programming laptop"]
        }

        "programing laptop"
        => {
        "normalized_query": "programming laptop",
        "keywords": ["programming", "laptop"],
        "phrases": ["programming laptop"]
        }

        "dev laptop"
        => {
        "normalized_query": "developer laptop",
        "keywords": ["developer", "programming", "laptop"],
        "phrases": ["developer laptop"]
        }

        "air purifer"
        => {
        "normalized_query": "air purifier",
        "keywords": ["air", "purifier"],
        "phrases": ["air purifier"]
        }

        "gaming laptop"
        => {
        "normalized_query": "gaming laptop",
        "keywords": ["gaming", "laptop"],
        "phrases": ["gaming laptop"]
        }

        Do not invent products.

        Do not select products.

        Do not invent technical specifications.

        Do not add unrelated keywords.

        Do not explain anything.

        Return JSON only.
        PROMPT;

        $userPrompt = sprintf(
            "CUSTOMER REQUEST:\n%s\n\nDETERMINISTIC INTENT:\n%s",
            trim($message),
            json_encode(
                $this->safeDeterministicIntent($deterministicIntent),
                JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
            )
        );
        try {
            $response = Http::withToken($apiKey)
                ->acceptJson()
                ->asJson()
                ->connectTimeout(5)
                ->timeout(15)
                ->post($url, [
                    'model' => $model,

                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => $systemPrompt,
                        ],
                        [
                            'role' => 'user',
                            'content' => $userPrompt,
                        ],
                    ],

                    'temperature' => 0,

                    'max_tokens' => 600,

                    'response_format' => [
                        'type' => 'json_object',
                    ],
                ]);

            if (!$response->successful()) {
                Log::warning(
                    'AI query understanding request failed.',
                    [
                        'status' => $response->status(),
                        'error' => $response->json('error'),
                    ]
                );

                return [];
            }

            $content = trim(
                (string) $response->json(
                    'choices.0.message.content'
                )
            );

            if ($content === '') {
                return [];
            }

            $parsed = json_decode(
                $this->stripJsonFences($content),
                true
            );

            if (!is_array($parsed)) {
                return [];
            }

            return $this->validateResult(
                $parsed,
                $categories
            );
        } catch (\Throwable $e) {
            Log::warning(
                'AI query understanding exception.',
                [
                    'error' => $e->getMessage(),
                ]
            );

            return [];
        }
    }

    /**
     * Get active catalog categories directly from the database.
     *
     * New categories automatically become available to the
     * query-understanding layer.
     */
    protected function catalogCategories(): array
    {
        return Category::query()
            ->whereHas('products', function ($query) {
                $query
                    ->where('is_active', true)
                    ->where('stock', '>', 0);
            })
            ->orderBy('slug')
            ->get([
                'name',
                'slug',
            ])
            ->map(fn (Category $category) => [
                'name' => $category->name,
                'slug' => $category->slug,
            ])
            ->values()
            ->all();
    }

    /**
     * Keep only useful deterministic information.
     */
    protected function safeDeterministicIntent(
        array $intent
    ): array {
        return [
            'category' => $intent['category'] ?? null,
            'brand' => $intent['brand'] ?? null,
            'max_price' => $intent['max_price'] ?? null,
            'min_price' => $intent['min_price'] ?? null,

            'keywords' => collect(
                $intent['keywords'] ?? []
            )->values()->all(),

            'filter_keywords' => collect(
                $intent['filter_keywords'] ?? []
            )->values()->all(),

            'exclude_keywords' => collect(
                $intent['exclude_keywords'] ?? []
            )->values()->all(),
        ];
    }

    /**
     * Validate AI output against the real catalog.
     */
protected function validateResult(
    array $result,
    array $categories
): array {
    $normalizedQuery = '';

    if (
        is_string($result['normalized_query'] ?? null)
    ) {
        $normalizedQuery = Str::lower(
            trim($result['normalized_query'])
        );
    }

    /*
     * AI keywords are semantic product terms only.
     *
     * Query-control tokens such as:
     * - under
     * - below
     * - less than
     * - 6000
     * - bdt
     *
     * must never become product-search keywords.
     *
     * Deterministic parsing owns price/category/brand constraints.
     */
    $controlWords = collect([
        'under',
        'below',
        'less',
        'than',
        'maximum',
        'max',
        'within',
        'up',
        'to',
        'upto',
        'price',
        'from',
        'above',
        'over',
        'minimum',
        'min',
        'between',
        'and',
        'bdt',
        'taka',
    ]);

    $keywords = $this->cleanStringList(
        $result['keywords'] ?? []
    );

    $keywords = collect($keywords)
        ->reject(
            fn (string $keyword) =>
                $controlWords->contains($keyword) ||
                preg_match('/^\d+(?:\.\d+)?$/', $keyword)
        )
        ->values()
        ->all();

    /*
     * AI phrases are semantic product phrases.
     *
     * A phrase containing price-control syntax is not a product phrase.
     *
     * Example:
     * "laptop under 6000 bdt"
     *
     * must not become a searchable product phrase.
     */
    $phrases = $this->cleanStringList(
        $result['phrases'] ?? []
    );

    $phrases = collect($phrases)
        ->reject(function (string $phrase) use ($controlWords) {
            $tokens = collect(
                preg_split('/\s+/', $phrase)
            )
                ->filter()
                ->map(
                    fn (string $token) =>
                        Str::lower(trim($token))
                );

            return $tokens->contains(
                fn (string $token) =>
                    $controlWords->contains($token) ||
                    preg_match(
                        '/^\d+(?:\.\d+)?$/',
                        $token
                    )
            );
        })
        ->values()
        ->all();

    return [
        'normalized_query' => $normalizedQuery,
        'keywords' => $keywords,
        'phrases' => $phrases,
    ];
}

    /**
     * Normalize AI string arrays.
     */
    protected function cleanStringList(
        mixed $value
    ): array {
        if (!is_array($value)) {
            return [];
        }

        return collect($value)
            ->filter(
                fn ($item) =>
                    is_string($item) &&
                    trim($item) !== ''
            )
            ->map(
                fn (string $item) =>
                    Str::lower(trim($item))
            )
            ->unique()
            ->take(20)
            ->values()
            ->all();
    }

    /**
     * Remove markdown JSON fences if the model adds them.
     */
    protected function stripJsonFences(
        string $content
    ): string {
        $content = trim($content);

        if (Str::startsWith($content, '```')) {
            $content = preg_replace(
                '/^```(?:json)?\s*/i',
                '',
                $content
            );

            $content = preg_replace(
                '/\s*```$/',
                '',
                $content
            );
        }

        return trim($content);
    }
}
