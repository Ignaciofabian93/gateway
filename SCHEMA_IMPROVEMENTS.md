# Ecommerce Schema Improvements for Recycled & Exchangeable Products

## Overview

The Prisma schema has been redesigned to better support your ecommerce platform for recycled and exchangeable products with clear distinction between persons and stores.

## Key Improvements

### 1. Unified Seller System

- **Before**: Separate `User` and `Store` models with confusing relationships
- **After**: Single `Seller` model with two profile types:
  - `PersonProfile` for individual sellers
  - `StoreProfile` for business sellers

### 2. Seller Type Distinction

- **Persons**: Can sell AND exchange products
- **Stores**: Can only sell products (exchanges disabled by default)
- Clear business rules enforced at the schema level

### 3. Enhanced Profile Information

#### Person Profiles

- Full name (firstName, lastName, displayName)
- Personal info (bio, birthday, gender)
- Profile and cover images
- Exchange preferences
- Social media links (JSON object for flexibility)

#### Store Profiles

- Business details (businessName, displayName, description)
- Business type and registration info
- Logo and cover images
- Business policies (shipping, returns)
- Business hours (JSON format)
- Minimum order amounts

### 4. Product Enhancements

- **Condition tracking**: New `ProductCondition` enum for recycled items
- **Sustainability metrics**:
  - Sustainability score (1-100)
  - Material composition
  - Recycled content percentage
- **Enhanced descriptions**: Condition-specific descriptions

### 5. Better Location System

- Optional location fields (no more hardcoded defaults)
- Cleaner relationships with City, County, Region, Country
- Flexible address system

### 6. Social Media Integration

- JSON field for flexible social media links
- Support for any platform (Instagram, Facebook, TikTok, etc.)
- Easy to extend without schema changes

## New Enums Added

```prisma
enum SellerType {
  PERSON
  STORE
}

enum Gender {
  MALE
  FEMALE
  NON_BINARY
  PREFER_NOT_TO_SAY
}

enum ProductCondition {
  NEW
  LIKE_NEW
  EXCELLENT
  GOOD
  FAIR
  POOR
  FOR_PARTS
  USED
  REFURBISHED
}
```

## Usage Examples

### Creating a Person Seller

```typescript
const personSeller = await prisma.seller.create({
  data: {
    email: "john@example.com",
    password: "hashed_password",
    sellerType: "PERSON",
    phone: "+1234567890",
    socialMediaLinks: {
      instagram: "https://instagram.com/johnsmith",
      facebook: "https://facebook.com/john.smith",
    },
    personProfile: {
      create: {
        firstName: "John",
        lastName: "Smith",
        bio: "Sustainable fashion enthusiast",
        allowExchanges: true,
      },
    },
  },
});
```

### Creating a Store Seller

```typescript
const storeSeller = await prisma.seller.create({
  data: {
    email: "contact@greenstore.com",
    password: "hashed_password",
    sellerType: "STORE",
    website: "https://greenstore.com",
    socialMediaLinks: {
      instagram: "https://instagram.com/greenstore",
      facebook: "https://facebook.com/greenstore",
    },
    storeProfile: {
      create: {
        businessName: "Green Store",
        description: "Eco-friendly products for sustainable living",
        businessType: "retail",
        allowExchanges: false,
        minOrderAmount: 2500, // $25.00 in cents
        businessHours: {
          monday: { open: "09:00", close: "17:00" },
          tuesday: { open: "09:00", close: "17:00" },
        },
      },
    },
  },
});
```

### Adding a Product with Condition

```typescript
const product = await prisma.product.create({
  data: {
    name: "Vintage Leather Jacket",
    description: "Beautiful vintage leather jacket in great condition",
    price: 8500, // $85.00 in cents
    sellerId: personSeller.id,
    condition: "GOOD",
    conditionDescription: "Minor wear on sleeves, overall excellent shape",
    isExchangeable: true,
    sustainabilityScore: 85,
    materialComposition: "100% genuine leather",
    recycledContent: 0,
    // ... other fields
  },
});
```

## Migration Strategy

1. **Backup your current database**
2. **Run the migration**: `npx prisma migrate dev --name "unified-seller-system"`
3. **Data migration script**: You'll need to migrate existing Users/Stores to the new Seller system
4. **Update application code**: Update queries to use the new schema structure

## Benefits

1. **Cleaner Architecture**: Single source of truth for all sellers
2. **Better Profile Pages**: Rich profile information for both persons and stores
3. **Flexible Social Media**: JSON-based social links support any platform
4. **Sustainability Focus**: Built-in tracking for recycled products
5. **Business Rules Enforcement**: Clear distinction between person/store capabilities
6. **Scalability**: Easy to extend profiles without major schema changes
7. **Type Safety**: Better TypeScript support with proper enums

## Next Steps

1. Run the Prisma migration
2. Create data migration scripts for existing data
3. Update your frontend components for the new profile structure
4. Implement the new sustainability features
5. Add validation for business rules (e.g., stores can't create exchanges)
