#!/bin/bash
sed -i '
# Update the stock type definition
s/stock?: number;/stock?: { stock?: number; isOutOfStock?: boolean; isLowStock?: boolean } | number;/

# Update the inStock check
s/inStock: item.inStock !== undefined ? item.inStock : item.stock ? item.stock > 0 : true,/inStock: item.inStock !== undefined ? item.inStock : (typeof item.stock === "object" ? !(item.stock.isOutOfStock ?? false) : (item.stock ?? 0) > 0),/

# Update the quantity assignment
s/\.\.\.(item.stock !== undefined && { quantity: item.stock }),/.\.\.((typeof item.stock === "object" \&\& item.stock.stock !== undefined) ? { quantity: item.stock.stock } : (typeof item.stock === "number" ? { quantity: item.stock } : {})),/
' product-search.service.ts
