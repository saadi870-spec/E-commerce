<?php

namespace App\Http\Requests\Store;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AddToCartRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'product_id' => [
                'required',
                'integer',
                Rule::exists('products', 'id')->where('is_active', true),
            ],
            'quantity' => [
                'required',
                'integer',
                'min:1',
                'max:'.max(1, (int) config('shop.checkout.max_quantity_per_line')),
            ],
        ];
    }
}
