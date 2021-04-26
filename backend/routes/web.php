<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MetaController;
use App\Http\Controllers\PixelsController;

// public pixel information
Route::get('pixel/{id}', MetaController::class.'@getPixel');

// pixel details
Route::get('pixels', PixelsController::class.'@all');
Route::post('pixels', PixelsController::class.'@create');

Route::get('/', function () {
    exit("Pepe? Is it you?");
});
