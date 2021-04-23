<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MetaController;

Route::get('pixel/{id}', MetaController::class.'@getPixel');

Route::get('/', function () {
    exit("Pepe? Is it you?");
});
