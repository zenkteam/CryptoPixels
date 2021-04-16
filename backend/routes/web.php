<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MetaController;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// MetaController::class.'@getMetadataByPixelId'
Route::post('api/meta', function(){
    exit("test");
});

Route::get('/', function () {
    return view('welcome');
});
