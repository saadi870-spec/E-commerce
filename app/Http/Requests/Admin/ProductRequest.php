<?php

namespace App\Http\Requests\Admin;

use App\Models\Product;
use App\Services\Pricing;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $product = $this->route('product');
        $product = $product instanceof Product ? $product : null;

        return [
            'name' => ['required', 'string', 'max:120'],
            'slug' => [
                'nullable',
                'string',
                'max:140',
                Rule::unique('products', 'slug')->ignore($product?->id),
            ],
            'sku' => [
                'required',
                'string',
                'max:40',
                Rule::unique('products', 'sku')->ignore($product?->id),
            ],
            'category_id' => ['required', 'integer', Rule::exists('categories', 'id')],
            'tagline' => ['nullable', 'string', 'max:180'],
            'description' => ['required', 'string', 'max:5000'],
            'price' => ['required', 'numeric', 'min:0', 'max:99999'],
            'compare_at_price' => ['nullable', 'numeric', 'min:0', 'max:99999'],
            'stock' => ['required', 'integer', 'min:0', 'max:100000'],
            'accent_color' => ['nullable', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'is_featured' => ['sometimes'],
            'is_active' => ['sometimes'],
            'specs' => ['nullable', 'array', 'max:12'],
            'specs.*.label' => ['required', 'string', 'max:60'],
            'specs.*.value' => ['required', 'string', 'max:120'],
        ];
    }

    /**
     * Get the validation error messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'accent_color.regex' => 'Use a hex color such as #0f766e.',
            'sku.unique' => 'That SKU is already in use.',
            'slug.unique' => 'That slug is already in use.',
        ];
    }

    /**
     * Get the attributes ready to be persisted on a product.
     *
     * Human operators enter prices in dollars; the database stores cents.
     *
     * @return array<string, mixed>
     */
    public function productAttributes(): array
    {
        $data = $this->validated();

        $data['slug'] = filled($data['slug'] ?? null)
            ? $data['slug']
            : Str::slug($data['name']);

        $data['price_cents'] = Pricing::toCents($data['price']);
        $data['compare_at_price_cents'] = filled($data['compare_at_price'] ?? null)
            ? Pricing::toCents($data['compare_at_price'])
            : null;
        $data['accent_color'] = $data['accent_color'] ?? '#3f3f46';
        $data['is_featured'] = $this->boolean('is_featured');
        $data['is_active'] = $this->boolean('is_active');
        $data['specs'] = $data['specs'] ?? [];

        unset($data['price'], $data['compare_at_price']);

        return $data;
    }
}
