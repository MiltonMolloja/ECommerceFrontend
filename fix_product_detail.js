const fs = require('fs');

const filePath = 'src/app/features/product-detail/product-detail.component.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Replace the problematic section
const oldCode = `    const inStock = product.inStock !== undefined ? product.inStock : (product.stock ? product.stock > 0 : true);

    return {
      productId: productId!,
      name,
      brand: brandName,
      category: categoryName,
      price: {
        current: currentPrice,
        original: product.originalPrice,
        currency,
        discount: product.discount || product.discountPercentage
      },
      rating: {
        average: rating,
        count: reviewCount
      },
      availability: {
        inStock,
        quantity: product.stock || product.stockQuantity
      },
      features: product.features || [],
      imageUrl: this.productImages()[0]
    };`;

const newCode = `    const inStock = product.inStock !== undefined ? product.inStock : (product.stock ? product.stock > 0 : true);

    // Build price object with proper optional handling
    const priceObject: {
      current: number;
      original?: number;
      currency: string;
      discount?: number;
    } = {
      current: currentPrice,
      currency
    };

    if (product.originalPrice !== undefined) {
      priceObject.original = product.originalPrice;
    }

    const discount = product.discount || product.discountPercentage;
    if (discount !== undefined) {
      priceObject.discount = discount;
    }

    // Build availability object with proper optional handling
    const availabilityObject: {
      inStock: boolean;
      quantity?: number;
    } = {
      inStock
    };

    const quantity = product.stock || product.stockQuantity;
    if (quantity !== undefined) {
      availabilityObject.quantity = quantity;
    }

    return {
      productId: productId!,
      name,
      brand: brandName,
      category: categoryName,
      price: priceObject,
      rating: {
        average: rating,
        count: reviewCount
      },
      availability: availabilityObject,
      features: product.features || [],
      imageUrl: this.productImages()[0]
    };`;

content = content.replace(oldCode, newCode);
fs.writeFileSync(filePath, content, 'utf8');
console.log('File updated successfully');
