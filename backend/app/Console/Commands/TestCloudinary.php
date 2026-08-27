<?php

namespace App\Console\Commands;

use Cloudinary\Cloudinary;
use Illuminate\Console\Command;

class TestCloudinary extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cloudinary:test';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verify the Cloudinary SDK configuration connection';

    /**
     * Execute the console command.
     */
    public function handle(Cloudinary $cloudinary)
    {
        $this->info('Testing Cloudinary SDK connection...');

        try {
            // Read configuration from the injected instance
            $cloudName = $cloudinary->configuration->cloud->cloudName;
            
            if (empty($cloudName)) {
                $this->error('Failed: Cloud name is empty. Check your config/services.php or .env layout.');
                return Command::FAILURE;
            }

            $this->info("Success! Connected to Cloudinary.");
            $this->info("Detected Cloud Name: {$cloudName}");
            
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Connection failed: " . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
