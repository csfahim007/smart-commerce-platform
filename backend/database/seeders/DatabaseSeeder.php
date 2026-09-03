<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Demo Users
        |--------------------------------------------------------------------------
        */

        User::updateOrCreate(
            ['email' => 'admin@aicommerce.test'],
            [
                'name' => 'AI Commerce Admin',
                'password' => Hash::make('Admin@12345'),
                'role' => 'admin',
            ]
        );

        User::updateOrCreate(
            ['email' => 'customer@aicommerce.test'],
            [
                'name' => 'Demo Customer',
                'password' => Hash::make('Customer@12345'),
                'role' => 'customer',
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | Categories
        |--------------------------------------------------------------------------
        */

        $categories = [
            [
                'name' => 'Laptops',
                'description' => 'Laptops for work, study, programming, gaming and everyday computing.',
                'sort_order' => 1,
            ],
            [
                'name' => 'Smartphones',
                'description' => 'Modern Android smartphones for communication, entertainment and productivity.',
                'sort_order' => 2,
            ],
            [
                'name' => 'Computer Components',
                'description' => 'Processors, graphics cards, motherboards, memory and PC components.',
                'sort_order' => 3,
            ],
            [
                'name' => 'Monitors',
                'description' => 'Computer monitors for productivity, gaming, design and entertainment.',
                'sort_order' => 4,
            ],
            [
                'name' => 'Accessories',
                'description' => 'Keyboards, mice, webcams, chargers and other computer accessories.',
                'sort_order' => 5,
            ],
            [
                'name' => 'Headphones & Audio',
                'description' => 'Headphones, earbuds and speakers for music, gaming and communication.',
                'sort_order' => 6,
            ],
            [
                'name' => 'Cameras',
                'description' => 'Digital cameras and photography equipment for creators and enthusiasts.',
                'sort_order' => 7,
            ],
            [
                'name' => 'Smartwatches',
                'description' => 'Smartwatches for notifications, fitness tracking and everyday use.',
                'sort_order' => 8,
            ],
            [
                'name' => 'Networking',
                'description' => 'Routers, Wi-Fi equipment and networking hardware.',
                'sort_order' => 9,
            ],
            [
                'name' => 'Storage',
                'description' => 'SSDs, hard drives and portable storage devices.',
                'sort_order' => 10,
            ],
        ];

        $categoryModels = [];

        foreach ($categories as $category) {
            $categoryModels[$category['name']] = Category::updateOrCreate(
                ['slug' => Str::slug($category['name'])],
                [
                    'name' => $category['name'],
                    'description' => $category['description'],
                    'is_active' => true,
                    'sort_order' => $category['sort_order'],
                ]
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Products
        |--------------------------------------------------------------------------
        */

        $products = [

            // -----------------------------------------------------------------
            // LAPTOPS
            // -----------------------------------------------------------------

            [
                'category' => 'Laptops',
                'name' => 'Lenovo IdeaPad Slim 3',
                'brand' => 'Lenovo',
                'price' => 58900,
                'stock' => 15,
                'description' => '15.6-inch productivity laptop with Intel Core i5 processor, 8GB RAM and 512GB SSD.',
                'attributes' => [
                    'processor' => 'Intel Core i5',
                    'ram' => '8GB',
                    'storage' => '512GB SSD',
                    'display' => '15.6 inch FHD',
                    'graphics' => 'Intel integrated graphics',
                    'wifi' => true,
                    'use_case' => ['office', 'study', 'programming'],
                ],
                'features' => [
                    'wifi' => true,
                    'ssd' => true,
                    'ram_8gb' => true,
                ],
            ],
            [
                'category' => 'Laptops',
                'name' => 'ASUS Vivobook 15',
                'brand' => 'ASUS',
                'price' => 67900,
                'stock' => 12,
                'description' => 'Slim everyday laptop with Intel Core i5, 8GB RAM and fast 512GB NVMe SSD.',
                'attributes' => [
                    'processor' => 'Intel Core i5',
                    'ram' => '8GB',
                    'storage' => '512GB NVMe SSD',
                    'display' => '15.6 inch FHD',
                    'graphics' => 'Intel integrated graphics',
                    'wifi' => true,
                    'use_case' => ['office', 'study', 'programming'],
                ],
                'features' => [
                    'wifi' => true,
                    'ssd' => true,
                    'ram_8gb' => true,
                ],
            ],
            [
                'category' => 'Laptops',
                'name' => 'Acer Aspire 5',
                'brand' => 'Acer',
                'price' => 74900,
                'stock' => 10,
                'description' => 'Versatile 15.6-inch laptop suitable for programming, productivity and university work.',
                'attributes' => [
                    'processor' => 'Intel Core i5',
                    'ram' => '16GB',
                    'storage' => '512GB SSD',
                    'display' => '15.6 inch FHD',
                    'graphics' => 'Intel integrated graphics',
                    'wifi' => true,
                    'use_case' => ['programming', 'office', 'study'],
                ],
                'features' => [
                    'wifi' => true,
                    'ssd' => true,
                    'ram_16gb' => true,
                ],
            ],
            [
                'category' => 'Laptops',
                'name' => 'HP 15s Ryzen 5',
                'brand' => 'HP',
                'price' => 71900,
                'stock' => 14,
                'description' => 'Affordable Ryzen 5 laptop with 8GB RAM, 512GB SSD and Full HD display.',
                'attributes' => [
                    'processor' => 'AMD Ryzen 5',
                    'ram' => '8GB',
                    'storage' => '512GB SSD',
                    'display' => '15.6 inch FHD',
                    'graphics' => 'AMD Radeon Graphics',
                    'wifi' => true,
                    'use_case' => ['study', 'office', 'programming'],
                ],
                'features' => [
                    'wifi' => true,
                    'ssd' => true,
                ],
            ],
            [
                'category' => 'Laptops',
                'name' => 'MSI Thin Gaming 15',
                'brand' => 'MSI',
                'price' => 119900,
                'stock' => 8,
                'description' => 'Gaming laptop with Intel Core i5 processor, 16GB RAM and dedicated NVIDIA graphics.',
                'attributes' => [
                    'processor' => 'Intel Core i5',
                    'ram' => '16GB',
                    'storage' => '512GB SSD',
                    'display' => '15.6 inch 144Hz',
                    'graphics' => 'NVIDIA GeForce RTX 2050',
                    'wifi' => true,
                    'use_case' => ['gaming', 'programming', 'content creation'],
                ],
                'features' => [
                    'wifi' => true,
                    'ssd' => true,
                    'ram_16gb' => true,
                    'dedicated_gpu' => true,
                ],
            ],
            [
                'category' => 'Laptops',
                'name' => 'Apple MacBook Air M2',
                'brand' => 'Apple',
                'price' => 129900,
                'stock' => 7,
                'description' => 'Lightweight MacBook Air powered by Apple M2 chip with 8GB unified memory and 256GB SSD.',
                'attributes' => [
                    'processor' => 'Apple M2',
                    'ram' => '8GB',
                    'storage' => '256GB SSD',
                    'display' => '13.6 inch Retina',
                    'graphics' => 'Integrated Apple GPU',
                    'wifi' => true,
                    'use_case' => ['programming', 'office', 'creative work'],
                ],
                'features' => [
                    'wifi' => true,
                    'ssd' => true,
                    'portable' => true,
                ],
            ],

            // -----------------------------------------------------------------
            // SMARTPHONES
            // -----------------------------------------------------------------

            [
                'category' => 'Smartphones',
                'name' => 'Samsung Galaxy A15',
                'brand' => 'Samsung',
                'price' => 18999,
                'stock' => 25,
                'description' => 'Affordable Samsung smartphone with AMOLED display and large battery.',
                'attributes' => [
                    'ram' => '6GB',
                    'storage' => '128GB',
                    'display' => '6.5 inch AMOLED',
                    'battery' => '5000mAh',
                    'camera' => '50MP',
                    '5g' => false,
                    'use_case' => ['everyday', 'social media'],
                ],
                'features' => [
                    '5g' => false,
                    'amoled' => true,
                ],
            ],
            [
                'category' => 'Smartphones',
                'name' => 'Samsung Galaxy A35 5G',
                'brand' => 'Samsung',
                'price' => 39999,
                'stock' => 18,
                'description' => 'Mid-range 5G smartphone with Super AMOLED display and capable camera system.',
                'attributes' => [
                    'ram' => '8GB',
                    'storage' => '128GB',
                    'display' => '6.6 inch Super AMOLED',
                    'battery' => '5000mAh',
                    'camera' => '50MP',
                    '5g' => true,
                    'use_case' => ['everyday', 'photography', 'gaming'],
                ],
                'features' => [
                    '5g' => true,
                    'amoled' => true,
                ],
            ],
            [
                'category' => 'Smartphones',
                'name' => 'Xiaomi Redmi Note 13',
                'brand' => 'Xiaomi',
                'price' => 22999,
                'stock' => 22,
                'description' => 'Feature-rich budget smartphone with AMOLED display and 108MP camera.',
                'attributes' => [
                    'ram' => '8GB',
                    'storage' => '128GB',
                    'display' => '6.67 inch AMOLED',
                    'battery' => '5000mAh',
                    'camera' => '108MP',
                    '5g' => false,
                    'use_case' => ['everyday', 'photography'],
                ],
                'features' => [
                    '5g' => false,
                    'amoled' => true,
                ],
            ],
            [
                'category' => 'Smartphones',
                'name' => 'Xiaomi Redmi Note 13 Pro 5G',
                'brand' => 'Xiaomi',
                'price' => 32999,
                'stock' => 16,
                'description' => '5G smartphone with 200MP camera, AMOLED display and 256GB storage.',
                'attributes' => [
                    'ram' => '8GB',
                    'storage' => '256GB',
                    'display' => '6.67 inch AMOLED 120Hz',
                    'battery' => '5100mAh',
                    'camera' => '200MP',
                    '5g' => true,
                    'use_case' => ['photography', 'gaming', 'everyday'],
                ],
                'features' => [
                    '5g' => true,
                    'amoled' => true,
                ],
            ],
            [
                'category' => 'Smartphones',
                'name' => 'OnePlus Nord CE 4',
                'brand' => 'OnePlus',
                'price' => 36999,
                'stock' => 13,
                'description' => 'Fast 5G smartphone with AMOLED 120Hz display and 5500mAh battery.',
                'attributes' => [
                    'ram' => '8GB',
                    'storage' => '128GB',
                    'display' => '6.7 inch AMOLED 120Hz',
                    'battery' => '5500mAh',
                    'camera' => '50MP',
                    '5g' => true,
                    'use_case' => ['gaming', 'everyday'],
                ],
                'features' => [
                    '5g' => true,
                    'amoled' => true,
                ],
            ],
            [
                'category' => 'Smartphones',
                'name' => 'Google Pixel 8a',
                'brand' => 'Google',
                'price' => 54999,
                'stock' => 9,
                'description' => 'Compact Google smartphone with excellent computational photography and 5G connectivity.',
                'attributes' => [
                    'ram' => '8GB',
                    'storage' => '128GB',
                    'display' => '6.1 inch OLED 120Hz',
                    'battery' => '4492mAh',
                    'camera' => '64MP',
                    '5g' => true,
                    'use_case' => ['photography', 'everyday'],
                ],
                'features' => [
                    '5g' => true,
                    'amoled' => false,
                ],
            ],

            // -----------------------------------------------------------------
            // COMPUTER COMPONENTS
            // -----------------------------------------------------------------

            [
                'category' => 'Computer Components',
                'name' => 'AMD Ryzen 5 5600',
                'brand' => 'AMD',
                'price' => 14500,
                'stock' => 20,
                'description' => '6-core 12-thread desktop processor for gaming and productivity.',
                'attributes' => [
                    'cores' => 6,
                    'threads' => 12,
                    'socket' => 'AM4',
                    'generation' => 'Zen 3',
                    'integrated_graphics' => false,
                    'use_case' => ['gaming', 'programming'],
                ],
                'features' => [
                    'integrated_graphics' => false,
                ],
            ],
            [
                'category' => 'Computer Components',
                'name' => 'AMD Ryzen 5 7600',
                'brand' => 'AMD',
                'price' => 21900,
                'stock' => 15,
                'description' => 'Modern 6-core AM5 processor with integrated graphics.',
                'attributes' => [
                    'cores' => 6,
                    'threads' => 12,
                    'socket' => 'AM5',
                    'generation' => 'Zen 4',
                    'integrated_graphics' => true,
                    'use_case' => ['gaming', 'programming'],
                ],
                'features' => [
                    'integrated_graphics' => true,
                ],
            ],
            [
                'category' => 'Computer Components',
                'name' => 'MSI B550M PRO-VDH WiFi',
                'brand' => 'MSI',
                'price' => 11900,
                'stock' => 12,
                'description' => 'Micro ATX AM4 motherboard with built-in Wi-Fi connectivity.',
                'attributes' => [
                    'socket' => 'AM4',
                    'form_factor' => 'Micro ATX',
                    'memory' => 'DDR4',
                    'wifi' => true,
                    'bluetooth' => true,
                    'use_case' => ['pc build', 'gaming'],
                ],
                'features' => [
                    'wifi' => true,
                    'bluetooth' => true,
                ],
            ],
            [
                'category' => 'Computer Components',
                'name' => 'ASUS TUF Gaming B650-Plus',
                'brand' => 'ASUS',
                'price' => 23900,
                'stock' => 10,
                'description' => 'ATX AM5 gaming motherboard with DDR5 support and no built-in Wi-Fi.',
                'attributes' => [
                    'socket' => 'AM5',
                    'form_factor' => 'ATX',
                    'memory' => 'DDR5',
                    'wifi' => false,
                    'bluetooth' => false,
                    'use_case' => ['pc build', 'gaming'],
                ],
                'features' => [
                    'wifi' => false,
                    'bluetooth' => false,
                ],
            ],
            [
                'category' => 'Computer Components',
                'name' => 'Corsair Vengeance 16GB DDR4',
                'brand' => 'Corsair',
                'price' => 4800,
                'stock' => 30,
                'description' => '16GB DDR4 desktop memory kit for modern productivity and gaming systems.',
                'attributes' => [
                    'capacity' => '16GB',
                    'type' => 'DDR4',
                    'speed' => '3200MHz',
                    'use_case' => ['gaming', 'programming', 'pc build'],
                ],
                'features' => [
                    'ddr4' => true,
                ],
            ],
            [
                'category' => 'Computer Components',
                'name' => 'Gigabyte GeForce RTX 4060',
                'brand' => 'Gigabyte',
                'price' => 42900,
                'stock' => 6,
                'description' => 'NVIDIA RTX 4060 graphics card with 8GB GDDR6 memory.',
                'attributes' => [
                    'vram' => '8GB GDDR6',
                    'interface' => 'PCIe 4.0',
                    'ray_tracing' => true,
                    'use_case' => ['gaming', 'content creation'],
                ],
                'features' => [
                    'dedicated_gpu' => true,
                    'ray_tracing' => true,
                ],
            ],

            // -----------------------------------------------------------------
            // MONITORS
            // -----------------------------------------------------------------

            [
                'category' => 'Monitors',
                'name' => 'AOC 24B2XH 24-inch',
                'brand' => 'AOC',
                'price' => 14900,
                'stock' => 15,
                'description' => '24-inch Full HD IPS monitor for office and everyday productivity.',
                'attributes' => [
                    'size' => '24 inch',
                    'resolution' => '1920x1080',
                    'panel' => 'IPS',
                    'refresh_rate' => '75Hz',
                    'use_case' => ['office', 'study'],
                ],
                'features' => [
                    'ips' => true,
                    'gaming' => false,
                ],
            ],
            [
                'category' => 'Monitors',
                'name' => 'LG 24MP400 24-inch',
                'brand' => 'LG',
                'price' => 15900,
                'stock' => 14,
                'description' => '24-inch Full HD monitor with IPS panel for home and office use.',
                'attributes' => [
                    'size' => '24 inch',
                    'resolution' => '1920x1080',
                    'panel' => 'IPS',
                    'refresh_rate' => '75Hz',
                    'use_case' => ['office', 'study'],
                ],
                'features' => [
                    'ips' => true,
                    'gaming' => false,
                ],
            ],
            [
                'category' => 'Monitors',
                'name' => 'Samsung LF24T350',
                'brand' => 'Samsung',
                'price' => 16900,
                'stock' => 12,
                'description' => '24-inch IPS Full HD monitor with AMD FreeSync support.',
                'attributes' => [
                    'size' => '24 inch',
                    'resolution' => '1920x1080',
                    'panel' => 'IPS',
                    'refresh_rate' => '75Hz',
                    'use_case' => ['office', 'gaming'],
                ],
                'features' => [
                    'ips' => true,
                    'freesync' => true,
                ],
            ],
            [
                'category' => 'Monitors',
                'name' => 'AOC 24G2SP Gaming Monitor',
                'brand' => 'AOC',
                'price' => 23900,
                'stock' => 9,
                'description' => '24-inch IPS gaming monitor with 165Hz refresh rate.',
                'attributes' => [
                    'size' => '24 inch',
                    'resolution' => '1920x1080',
                    'panel' => 'IPS',
                    'refresh_rate' => '165Hz',
                    'use_case' => ['gaming'],
                ],
                'features' => [
                    'ips' => true,
                    'gaming' => true,
                    'high_refresh_rate' => true,
                ],
            ],
            [
                'category' => 'Monitors',
                'name' => 'LG UltraGear 27GN800',
                'brand' => 'LG',
                'price' => 39900,
                'stock' => 7,
                'description' => '27-inch QHD IPS gaming monitor with 144Hz refresh rate.',
                'attributes' => [
                    'size' => '27 inch',
                    'resolution' => '2560x1440',
                    'panel' => 'IPS',
                    'refresh_rate' => '144Hz',
                    'use_case' => ['gaming', 'content creation'],
                ],
                'features' => [
                    'ips' => true,
                    'gaming' => true,
                    'high_refresh_rate' => true,
                ],
            ],
            [
                'category' => 'Monitors',
                'name' => 'Dell S2721QS 27-inch',
                'brand' => 'Dell',
                'price' => 42900,
                'stock' => 6,
                'description' => '27-inch 4K IPS monitor designed for productivity and creative work.',
                'attributes' => [
                    'size' => '27 inch',
                    'resolution' => '3840x2160',
                    'panel' => 'IPS',
                    'refresh_rate' => '60Hz',
                    'use_case' => ['office', 'design', 'content creation'],
                ],
                'features' => [
                    'ips' => true,
                    '4k' => true,
                ],
            ],

            // -----------------------------------------------------------------
            // ACCESSORIES
            // -----------------------------------------------------------------

            [
                'category' => 'Accessories',
                'name' => 'Logitech K120 Keyboard',
                'brand' => 'Logitech',
                'price' => 1100,
                'stock' => 40,
                'description' => 'Reliable wired USB keyboard for everyday office and home use.',
                'attributes' => [
                    'connection' => 'USB',
                    'type' => 'Membrane',
                    'wireless' => false,
                    'use_case' => ['office', 'study'],
                ],
                'features' => [
                    'wireless' => false,
                ],
            ],
            [
                'category' => 'Accessories',
                'name' => 'Logitech K380 Bluetooth Keyboard',
                'brand' => 'Logitech',
                'price' => 3900,
                'stock' => 20,
                'description' => 'Compact wireless Bluetooth keyboard for computers, tablets and phones.',
                'attributes' => [
                    'connection' => 'Bluetooth',
                    'type' => 'Compact',
                    'wireless' => true,
                    'use_case' => ['office', 'portable'],
                ],
                'features' => [
                    'wireless' => true,
                    'bluetooth' => true,
                ],
            ],
            [
                'category' => 'Accessories',
                'name' => 'Logitech M90 Mouse',
                'brand' => 'Logitech',
                'price' => 900,
                'stock' => 45,
                'description' => 'Simple reliable wired optical mouse for everyday computing.',
                'attributes' => [
                    'connection' => 'USB',
                    'sensor' => 'Optical',
                    'wireless' => false,
                    'use_case' => ['office', 'study'],
                ],
                'features' => [
                    'wireless' => false,
                ],
            ],
            [
                'category' => 'Accessories',
                'name' => 'Logitech G102 Gaming Mouse',
                'brand' => 'Logitech',
                'price' => 2200,
                'stock' => 25,
                'description' => 'Wired gaming mouse with programmable buttons and high precision sensor.',
                'attributes' => [
                    'connection' => 'USB',
                    'sensor' => 'High precision optical',
                    'dpi' => '8000 DPI',
                    'wireless' => false,
                    'use_case' => ['gaming'],
                ],
                'features' => [
                    'wireless' => false,
                    'gaming' => true,
                ],
            ],
            [
                'category' => 'Accessories',
                'name' => 'TP-Link USB Wi-Fi Adapter',
                'brand' => 'TP-Link',
                'price' => 1400,
                'stock' => 30,
                'description' => 'Compact USB wireless adapter for adding Wi-Fi connectivity to desktop computers.',
                'attributes' => [
                    'interface' => 'USB',
                    'wifi' => true,
                    'wireless' => true,
                    'use_case' => ['networking', 'desktop'],
                ],
                'features' => [
                    'wifi' => true,
                    'wireless' => true,
                ],
            ],
            [
                'category' => 'Accessories',
                'name' => 'Anker 20W USB-C Charger',
                'brand' => 'Anker',
                'price' => 1800,
                'stock' => 35,
                'description' => 'Compact 20W USB-C fast charger for smartphones and compatible devices.',
                'attributes' => [
                    'power' => '20W',
                    'port' => 'USB-C',
                    'fast_charging' => true,
                    'use_case' => ['mobile', 'travel'],
                ],
                'features' => [
                    'fast_charging' => true,
                    'usb_c' => true,
                ],
            ],

            // -----------------------------------------------------------------
            // AUDIO
            // -----------------------------------------------------------------

            [
                'category' => 'Headphones & Audio',
                'name' => 'JBL Tune 510BT',
                'brand' => 'JBL',
                'price' => 3990,
                'stock' => 20,
                'description' => 'Wireless on-ear Bluetooth headphones with long battery life.',
                'attributes' => [
                    'type' => 'On-ear',
                    'connection' => 'Bluetooth',
                    'noise_cancellation' => false,
                    'battery' => '40 hours',
                    'use_case' => ['music', 'travel'],
                ],
                'features' => [
                    'wireless' => true,
                    'bluetooth' => true,
                    'noise_cancellation' => false,
                ],
            ],
            [
                'category' => 'Headphones & Audio',
                'name' => 'Sony WH-CH520',
                'brand' => 'Sony',
                'price' => 5490,
                'stock' => 16,
                'description' => 'Lightweight Bluetooth wireless headphones with up to 50 hours battery life.',
                'attributes' => [
                    'type' => 'On-ear',
                    'connection' => 'Bluetooth',
                    'noise_cancellation' => false,
                    'battery' => '50 hours',
                    'use_case' => ['music', 'travel'],
                ],
                'features' => [
                    'wireless' => true,
                    'bluetooth' => true,
                    'noise_cancellation' => false,
                ],
            ],
            [
                'category' => 'Headphones & Audio',
                'name' => 'Anker Soundcore Q20i',
                'brand' => 'Anker',
                'price' => 6490,
                'stock' => 14,
                'description' => 'Wireless over-ear headphones with hybrid active noise cancellation.',
                'attributes' => [
                    'type' => 'Over-ear',
                    'connection' => 'Bluetooth',
                    'noise_cancellation' => true,
                    'battery' => '40 hours',
                    'use_case' => ['music', 'travel', 'office'],
                ],
                'features' => [
                    'wireless' => true,
                    'bluetooth' => true,
                    'noise_cancellation' => true,
                ],
            ],
            [
                'category' => 'Headphones & Audio',
                'name' => 'Realme Buds Air 5',
                'brand' => 'Realme',
                'price' => 4990,
                'stock' => 20,
                'description' => 'True wireless earbuds with active noise cancellation.',
                'attributes' => [
                    'type' => 'TWS earbuds',
                    'connection' => 'Bluetooth',
                    'noise_cancellation' => true,
                    'battery' => '38 hours with case',
                    'use_case' => ['music', 'calls', 'travel'],
                ],
                'features' => [
                    'wireless' => true,
                    'bluetooth' => true,
                    'noise_cancellation' => true,
                ],
            ],
            [
                'category' => 'Headphones & Audio',
                'name' => 'HyperX Cloud Stinger 2',
                'brand' => 'HyperX',
                'price' => 4990,
                'stock' => 13,
                'description' => 'Wired gaming headset with comfortable earcups and microphone.',
                'attributes' => [
                    'type' => 'Gaming headset',
                    'connection' => '3.5mm',
                    'microphone' => true,
                    'wireless' => false,
                    'use_case' => ['gaming', 'calls'],
                ],
                'features' => [
                    'wireless' => false,
                    'gaming' => true,
                    'microphone' => true,
                ],
            ],
            [
                'category' => 'Headphones & Audio',
                'name' => 'Edifier R1280DB Speakers',
                'brand' => 'Edifier',
                'price' => 12900,
                'stock' => 8,
                'description' => 'Powered bookshelf speakers with Bluetooth and multiple inputs.',
                'attributes' => [
                    'type' => 'Bookshelf speakers',
                    'connection' => 'Bluetooth / RCA / Optical',
                    'wireless' => true,
                    'use_case' => ['music', 'desktop'],
                ],
                'features' => [
                    'wireless' => true,
                    'bluetooth' => true,
                ],
            ],

            // -----------------------------------------------------------------
            // CAMERAS
            // -----------------------------------------------------------------

            [
                'category' => 'Cameras',
                'name' => 'Canon EOS R100',
                'brand' => 'Canon',
                'price' => 69900,
                'stock' => 5,
                'description' => 'Compact mirrorless camera suitable for photography and beginner creators.',
                'attributes' => [
                    'type' => 'Mirrorless',
                    'sensor' => 'APS-C',
                    'megapixels' => '24.1MP',
                    'video' => '4K',
                    'wifi' => true,
                    'use_case' => ['photography', 'video'],
                ],
                'features' => [
                    'wifi' => true,
                    'mirrorless' => true,
                    '4k' => true,
                ],
            ],
            [
                'category' => 'Cameras',
                'name' => 'Canon EOS R10',
                'brand' => 'Canon',
                'price' => 112900,
                'stock' => 4,
                'description' => 'Advanced APS-C mirrorless camera for photography, video and content creation.',
                'attributes' => [
                    'type' => 'Mirrorless',
                    'sensor' => 'APS-C',
                    'megapixels' => '24.2MP',
                    'video' => '4K 60fps',
                    'wifi' => true,
                    'use_case' => ['photography', 'video', 'content creation'],
                ],
                'features' => [
                    'wifi' => true,
                    'mirrorless' => true,
                    '4k' => true,
                ],
            ],
            [
                'category' => 'Cameras',
                'name' => 'Sony Alpha a6400',
                'brand' => 'Sony',
                'price' => 109900,
                'stock' => 5,
                'description' => 'APS-C mirrorless camera with fast autofocus and 4K video recording.',
                'attributes' => [
                    'type' => 'Mirrorless',
                    'sensor' => 'APS-C',
                    'megapixels' => '24.2MP',
                    'video' => '4K',
                    'wifi' => true,
                    'use_case' => ['photography', 'video'],
                ],
                'features' => [
                    'wifi' => true,
                    'mirrorless' => true,
                    '4k' => true,
                ],
            ],
            [
                'category' => 'Cameras',
                'name' => 'Nikon Z30',
                'brand' => 'Nikon',
                'price' => 84900,
                'stock' => 4,
                'description' => 'Creator-focused APS-C mirrorless camera designed for video and vlogging.',
                'attributes' => [
                    'type' => 'Mirrorless',
                    'sensor' => 'APS-C',
                    'megapixels' => '20.9MP',
                    'video' => '4K',
                    'wifi' => true,
                    'use_case' => ['vlogging', 'video', 'content creation'],
                ],
                'features' => [
                    'wifi' => true,
                    'mirrorless' => true,
                    '4k' => true,
                ],
            ],
            [
                'category' => 'Cameras',
                'name' => 'Sony ZV-E10',
                'brand' => 'Sony',
                'price' => 89900,
                'stock' => 4,
                'description' => 'APS-C interchangeable-lens camera designed for creators and vloggers.',
                'attributes' => [
                    'type' => 'Mirrorless',
                    'sensor' => 'APS-C',
                    'megapixels' => '24.2MP',
                    'video' => '4K',
                    'wifi' => true,
                    'use_case' => ['vlogging', 'video', 'content creation'],
                ],
                'features' => [
                    'wifi' => true,
                    'mirrorless' => true,
                    '4k' => true,
                ],
            ],
            [
                'category' => 'Cameras',
                'name' => 'Fujifilm X-S10',
                'brand' => 'Fujifilm',
                'price' => 119900,
                'stock' => 3,
                'description' => 'APS-C mirrorless camera with in-body image stabilization for photography and video.',
                'attributes' => [
                    'type' => 'Mirrorless',
                    'sensor' => 'APS-C',
                    'megapixels' => '26.1MP',
                    'video' => '4K',
                    'wifi' => true,
                    'use_case' => ['photography', 'video'],
                ],
                'features' => [
                    'wifi' => true,
                    'mirrorless' => true,
                    '4k' => true,
                    'image_stabilization' => true,
                ],
            ],

            // -----------------------------------------------------------------
            // SMARTWATCHES
            // -----------------------------------------------------------------

            [
                'category' => 'Smartwatches',
                'name' => 'Xiaomi Redmi Watch 3 Active',
                'brand' => 'Xiaomi',
                'price' => 4990,
                'stock' => 20,
                'description' => 'Affordable smartwatch with fitness tracking, Bluetooth calling and large display.',
                'attributes' => [
                    'display' => '1.83 inch',
                    'bluetooth_calling' => true,
                    'gps' => false,
                    'water_resistance' => true,
                    'use_case' => ['fitness', 'everyday'],
                ],
                'features' => [
                    'gps' => false,
                    'bluetooth_calling' => true,
                ],
            ],
            [
                'category' => 'Smartwatches',
                'name' => 'Amazfit Bip 5',
                'brand' => 'Amazfit',
                'price' => 6990,
                'stock' => 15,
                'description' => 'Feature-rich smartwatch with GPS, fitness tracking and Bluetooth calling.',
                'attributes' => [
                    'display' => '1.91 inch',
                    'bluetooth_calling' => true,
                    'gps' => true,
                    'water_resistance' => true,
                    'use_case' => ['fitness', 'everyday'],
                ],
                'features' => [
                    'gps' => true,
                    'bluetooth_calling' => true,
                ],
            ],
            [
                'category' => 'Smartwatches',
                'name' => 'Samsung Galaxy Watch 6',
                'brand' => 'Samsung',
                'price' => 28900,
                'stock' => 8,
                'description' => 'Premium Android smartwatch with AMOLED display, GPS and health tracking.',
                'attributes' => [
                    'display' => '1.5 inch AMOLED',
                    'bluetooth_calling' => true,
                    'gps' => true,
                    'water_resistance' => true,
                    'use_case' => ['fitness', 'everyday'],
                ],
                'features' => [
                    'gps' => true,
                    'amoled' => true,
                    'bluetooth_calling' => true,
                ],
            ],
            [
                'category' => 'Smartwatches',
                'name' => 'Huawei Watch Fit 3',
                'brand' => 'Huawei',
                'price' => 17900,
                'stock' => 10,
                'description' => 'Slim fitness smartwatch with AMOLED display, GPS and health monitoring.',
                'attributes' => [
                    'display' => '1.82 inch AMOLED',
                    'bluetooth_calling' => true,
                    'gps' => true,
                    'water_resistance' => true,
                    'use_case' => ['fitness', 'everyday'],
                ],
                'features' => [
                    'gps' => true,
                    'amoled' => true,
                ],
            ],
            [
                'category' => 'Smartwatches',
                'name' => 'Amazfit GTR 4',
                'brand' => 'Amazfit',
                'price' => 19900,
                'stock' => 8,
                'description' => 'Premium fitness smartwatch with dual-band GPS and AMOLED display.',
                'attributes' => [
                    'display' => '1.43 inch AMOLED',
                    'bluetooth_calling' => true,
                    'gps' => true,
                    'water_resistance' => true,
                    'use_case' => ['fitness', 'sports'],
                ],
                'features' => [
                    'gps' => true,
                    'amoled' => true,
                ],
            ],
            [
                'category' => 'Smartwatches',
                'name' => 'Haylou Solar Lite',
                'brand' => 'Haylou',
                'price' => 3490,
                'stock' => 18,
                'description' => 'Budget-friendly smartwatch for basic notifications and fitness tracking.',
                'attributes' => [
                    'display' => '1.38 inch',
                    'bluetooth_calling' => false,
                    'gps' => false,
                    'water_resistance' => true,
                    'use_case' => ['fitness', 'everyday'],
                ],
                'features' => [
                    'gps' => false,
                    'bluetooth_calling' => false,
                ],
            ],

            // -----------------------------------------------------------------
            // NETWORKING
            // -----------------------------------------------------------------

            [
                'category' => 'Networking',
                'name' => 'TP-Link Archer C6',
                'brand' => 'TP-Link',
                'price' => 3490,
                'stock' => 20,
                'description' => 'Dual-band AC1200 wireless router for home and small office networks.',
                'attributes' => [
                    'wifi_standard' => 'Wi-Fi 5',
                    'speed' => 'AC1200',
                    'bands' => 'Dual band',
                    'gigabit' => true,
                    'use_case' => ['home', 'office'],
                ],
                'features' => [
                    'wifi' => true,
                    'gigabit' => true,
                    'dual_band' => true,
                ],
            ],
            [
                'category' => 'Networking',
                'name' => 'TP-Link Archer AX10',
                'brand' => 'TP-Link',
                'price' => 5990,
                'stock' => 15,
                'description' => 'Wi-Fi 6 AX1500 router designed for fast home networking.',
                'attributes' => [
                    'wifi_standard' => 'Wi-Fi 6',
                    'speed' => 'AX1500',
                    'bands' => 'Dual band',
                    'gigabit' => true,
                    'use_case' => ['home', 'gaming'],
                ],
                'features' => [
                    'wifi' => true,
                    'wifi_6' => true,
                    'gigabit' => true,
                ],
            ],
            [
                'category' => 'Networking',
                'name' => 'Tenda AC10',
                'brand' => 'Tenda',
                'price' => 2890,
                'stock' => 22,
                'description' => 'Affordable AC1200 dual-band wireless router for home users.',
                'attributes' => [
                    'wifi_standard' => 'Wi-Fi 5',
                    'speed' => 'AC1200',
                    'bands' => 'Dual band',
                    'gigabit' => true,
                    'use_case' => ['home'],
                ],
                'features' => [
                    'wifi' => true,
                    'gigabit' => true,
                    'dual_band' => true,
                ],
            ],
            [
                'category' => 'Networking',
                'name' => 'Mercusys MR70X',
                'brand' => 'Mercusys',
                'price' => 3990,
                'stock' => 18,
                'description' => 'Wi-Fi 6 AX1800 dual-band gigabit router for modern homes.',
                'attributes' => [
                    'wifi_standard' => 'Wi-Fi 6',
                    'speed' => 'AX1800',
                    'bands' => 'Dual band',
                    'gigabit' => true,
                    'use_case' => ['home', 'gaming'],
                ],
                'features' => [
                    'wifi' => true,
                    'wifi_6' => true,
                    'gigabit' => true,
                ],
            ],
            [
                'category' => 'Networking',
                'name' => 'TP-Link TL-SG108',
                'brand' => 'TP-Link',
                'price' => 2890,
                'stock' => 20,
                'description' => '8-port unmanaged gigabit Ethernet switch for home and office networks.',
                'attributes' => [
                    'ports' => 8,
                    'speed' => 'Gigabit',
                    'managed' => false,
                    'wireless' => false,
                    'use_case' => ['office', 'networking'],
                ],
                'features' => [
                    'wireless' => false,
                    'gigabit' => true,
                ],
            ],
            [
                'category' => 'Networking',
                'name' => 'Ubiquiti UniFi U6 Lite',
                'brand' => 'Ubiquiti',
                'price' => 13900,
                'stock' => 7,
                'description' => 'Wi-Fi 6 access point designed for reliable home and business wireless networks.',
                'attributes' => [
                    'wifi_standard' => 'Wi-Fi 6',
                    'speed' => 'AX1500',
                    'power' => 'PoE',
                    'gigabit' => true,
                    'use_case' => ['office', 'business', 'home'],
                ],
                'features' => [
                    'wifi' => true,
                    'wifi_6' => true,
                    'gigabit' => true,
                ],
            ],

            // -----------------------------------------------------------------
            // STORAGE
            // -----------------------------------------------------------------

            [
                'category' => 'Storage',
                'name' => 'Kingston NV2 500GB NVMe SSD',
                'brand' => 'Kingston',
                'price' => 4300,
                'stock' => 25,
                'description' => 'Compact PCIe NVMe SSD suitable for laptops and desktop computers.',
                'attributes' => [
                    'capacity' => '500GB',
                    'type' => 'NVMe SSD',
                    'interface' => 'PCIe 4.0',
                    'portable' => false,
                    'use_case' => ['pc upgrade', 'laptop upgrade'],
                ],
                'features' => [
                    'ssd' => true,
                    'nvme' => true,
                ],
            ],
            [
                'category' => 'Storage',
                'name' => 'WD Blue SN570 1TB NVMe SSD',
                'brand' => 'Western Digital',
                'price' => 7900,
                'stock' => 18,
                'description' => '1TB PCIe NVMe SSD for fast desktop and laptop storage.',
                'attributes' => [
                    'capacity' => '1TB',
                    'type' => 'NVMe SSD',
                    'interface' => 'PCIe 3.0',
                    'portable' => false,
                    'use_case' => ['pc upgrade', 'gaming'],
                ],
                'features' => [
                    'ssd' => true,
                    'nvme' => true,
                ],
            ],
            [
                'category' => 'Storage',
                'name' => 'Samsung 980 1TB NVMe SSD',
                'brand' => 'Samsung',
                'price' => 9200,
                'stock' => 15,
                'description' => 'High-performance 1TB NVMe SSD for desktops and laptops.',
                'attributes' => [
                    'capacity' => '1TB',
                    'type' => 'NVMe SSD',
                    'interface' => 'PCIe 3.0',
                    'portable' => false,
                    'use_case' => ['gaming', 'programming', 'pc upgrade'],
                ],
                'features' => [
                    'ssd' => true,
                    'nvme' => true,
                ],
            ],
            [
                'category' => 'Storage',
                'name' => 'Crucial BX500 1TB SATA SSD',
                'brand' => 'Crucial',
                'price' => 6900,
                'stock' => 20,
                'description' => 'Affordable 1TB SATA SSD for upgrading older desktops and laptops.',
                'attributes' => [
                    'capacity' => '1TB',
                    'type' => 'SATA SSD',
                    'interface' => 'SATA III',
                    'portable' => false,
                    'use_case' => ['pc upgrade', 'laptop upgrade'],
                ],
                'features' => [
                    'ssd' => true,
                    'sata' => true,
                ],
            ],
            [
                'category' => 'Storage',
                'name' => 'Seagate Barracuda 2TB HDD',
                'brand' => 'Seagate',
                'price' => 6500,
                'stock' => 16,
                'description' => '2TB desktop hard drive for general storage and backups.',
                'attributes' => [
                    'capacity' => '2TB',
                    'type' => 'HDD',
                    'interface' => 'SATA III',
                    'portable' => false,
                    'use_case' => ['backup', 'storage'],
                ],
                'features' => [
                    'hdd' => true,
                    'ssd' => false,
                ],
            ],
            [
                'category' => 'Storage',
                'name' => 'Samsung T7 Portable SSD 1TB',
                'brand' => 'Samsung',
                'price' => 12900,
                'stock' => 10,
                'description' => 'Portable 1TB external SSD with USB-C connectivity for fast file transfers.',
                'attributes' => [
                    'capacity' => '1TB',
                    'type' => 'Portable SSD',
                    'interface' => 'USB-C',
                    'portable' => true,
                    'use_case' => ['backup', 'travel', 'content creation'],
                ],
                'features' => [
                    'ssd' => true,
                    'portable' => true,
                    'usb_c' => true,
                ],
            ],
        ];

        /*
        |--------------------------------------------------------------------------
        | Insert / Update Products
        |--------------------------------------------------------------------------
        */

        foreach ($products as $product) {
            $category = $categoryModels[$product['category']];

            Product::updateOrCreate(
                ['sku' => $product['brand'] . '-' . Str::slug($product['name'])],
                [
                    'category_id' => $category->id,
                    'name' => $product['name'],
                    'slug' => Str::slug($product['name']),
                    'sku' => $product['brand'] . '-' . Str::slug($product['name']),
                    'description' => $product['description'],
                    'attributes' => $product['attributes'],
                    'ai_tags' => [
                        'brand' => $product['brand'],
                        'category' => Str::slug($product['category']),
                        'features' => $product['features'],
                        'use_case' => $product['attributes']['use_case'] ?? [],
                    ],
                    'price' => $product['price'],
                    'stock' => $product['stock'],
                    'is_active' => true,
                ]
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Summary
        |--------------------------------------------------------------------------
        */

        $this->command?->info('Demo catalog seeded successfully.');
        $this->command?->info('Categories: ' . Category::count());
        $this->command?->info('Products: ' . Product::count());
        $this->command?->info('Admin: admin@aicommerce.test / Admin@12345');
        $this->command?->info('Customer: customer@aicommerce.test / Customer@12345');
    }
}