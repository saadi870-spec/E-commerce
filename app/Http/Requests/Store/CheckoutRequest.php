<?php

namespace App\Http\Requests\Store;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CheckoutRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:40'],
            'address_line1' => ['required', 'string', 'max:180'],
            'address_line2' => ['nullable', 'string', 'max:180'],
            'city' => ['required', 'string', 'max:80'],
            'state' => ['required', 'string', 'max:80'],
            'postal_code' => ['required', 'string', 'max:16'],
            'country' => ['required', 'string', 'regex:/^[A-Za-z]{2}$/'],
            'payment_method' => [
                'required',
                Rule::in(array_keys(config('shop.payment_methods'))),
            ],
        ];
    }

    /**
     * Get the error messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'payment_method' => 'Choose a payment method to continue.',
        ];
    }
}
