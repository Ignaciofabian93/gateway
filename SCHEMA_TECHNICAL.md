# Database Schema - Technical Relationship Map

## Complete Entity Relationship Diagram with Field Details

```mermaid
erDiagram
    %% Admin System
    Admin {
        string id PK
        string email UK
        string password
        string name
        datetime createdAt
        datetime updatedAt
    }

    %% Core Seller Entity
    Seller {
        string id PK
        string email UK
        string password
        SellerType sellerType
        boolean isActive
        boolean isVerified
        datetime createdAt
        datetime updatedAt
        string address
        int cityId FK
        int countryId FK
        int countyId FK
        int regionId FK
        string phone
        string website
        ContactMethod preferredContactMethod
        json socialMediaLinks
        AccountType accountType
        int points
        int userCategoryId FK
    }

    %% Seller Profiles
    PersonProfile {
        string id PK
        string sellerId FK
        string firstName
        string lastName
        string displayName
        string bio
        datetime birthday
        string profileImage
        string coverImage
        boolean allowExchanges
    }

    StoreProfile {
        string id PK
        string sellerId FK
        string businessName
        string displayName
        string description
        string logo
        string coverImage
        string businessType
        string taxId
        string businessRegistration
        boolean allowExchanges
        int minOrderAmount
        string shippingPolicy
        string returnPolicy
        json businessHours
    }

    %% Location System
    Country {
        int id PK
        string country
    }

    Region {
        int id PK
        string region
        int countryId FK
    }

    City {
        int id PK
        string city
        int regionId FK
    }

    County {
        int id PK
        string county
        int cityId FK
    }

    %% User Categories
    UserCategory {
        int id PK
        string name
        int categoryDiscountAmount
        int pointsThreshold
        int level
    }

    %% Product System
    Department {
        int id PK
        string departmentName
    }

    DepartmentCategory {
        int id PK
        int departmentId FK
        string departmentCategoryName
    }

    MaterialImpactEstimate {
        int id PK
        string materialType
        float estimatedCo2SavingsKG
        float estimatedWaterSavingsLT
    }

    ProductCategory {
        int id PK
        int departmentCategoryId FK
        float averageWeight
        string productCategoryName
        int firstMaterialTypeId FK
        float firstMaterialTypeQuantity
        int secondMaterialTypeId FK
        float secondMaterialTypeQuantity
        int thirdMaterialTypeId FK
        float thirdMaterialTypeQuantity
        int fourthMaterialTypeId FK
        float fourthMaterialTypeQuantity
        int fifthMaterialTypeId FK
        float fifthMaterialTypeQuantity
        string[] keywords
        ProductSize size
        WeightUnit weightUnit
    }

    Product {
        int id PK
        string name
        string description
        int price
        boolean hasOffer
        int offerPrice
        int stock
        string sellerId FK
        Badge[] badges
        string barcode UK
        string brand
        string color
        datetime createdAt
        string[] images
        string[] interests
        boolean isActive
        boolean isExchangeable
        int productCategoryId FK
        int ratingCount
        float ratings
        int reviewsNumber
        string sku
        datetime updatedAt
        ProductCondition condition
        string conditionDescription
        int sustainabilityScore
        string materialComposition
        float recycledContent
    }

    %% Product Interactions
    ProductLike {
        int id PK
        int productId FK
        string sellerId FK
    }

    ProductComment {
        int id PK
        string comment
        int productId FK
        string sellerId FK
    }

    %% Commerce System
    ShippingStatus {
        int id PK
        ShippingStage status
    }

    Order {
        int id PK
        string sellerId FK
        datetime createdAt
        int shippingStatusId FK
    }

    OrderItem {
        int id PK
        int orderId FK
        int productId FK
        int quantity
    }

    Transaction {
        int id PK
        TransactionKind kind
        int pointsCollected
        datetime createdAt
        string sellerId FK
    }

    Exchange {
        int id PK
        int transactionId FK
        int offeredProductId FK
        int requestedProductId FK
        ExchangeStatus status
        string notes
        datetime createdAt
        datetime completedAt
    }

    %% Communication System
    Chat {
        int id PK
        string senderId FK
        string receiverId FK
        int productId FK
        boolean isExchange
        datetime createdAt
    }

    Message {
        int id PK
        int chatId FK
        string senderId FK
        string content
        datetime createdAt
    }

    %% Social System
    Match {
        int id PK
        string senderId FK
        string receiverId FK
        datetime createdAt
        boolean isMatched
    }

    Story {
        int id PK
        string[] images
        string title
        string description
        string sellerId FK
    }

    %% Authentication
    Session {
        string id PK
        string token UK
        datetime createdAt
        datetime expiresAt
        string sellerId FK
    }

    %% Impact Messages
    Co2ImpactMessage {
        int id PK
        float min
        float max
        string message1
        string message2
        string message3
    }

    WaterImpactMessage {
        int id PK
        float min
        float max
        string message1
        string message2
        string message3
    }

    %% Relationships
    Seller ||--|| PersonProfile : "1:1"
    Seller ||--|| StoreProfile : "1:1"
    Seller ||--o{ Product : "1:many"
    Seller ||--o{ Order : "1:many"
    Seller ||--o{ Session : "1:many"
    Seller ||--o{ Transaction : "1:many"
    Seller ||--o{ Story : "1:many"
    Seller ||--o{ ProductLike : "1:many"
    Seller ||--o{ ProductComment : "1:many"
    Seller ||--o{ Chat : "sender 1:many"
    Seller ||--o{ Chat : "receiver 1:many"
    Seller ||--o{ Message : "1:many"
    Seller ||--o{ Match : "sender 1:many"
    Seller ||--o{ Match : "receiver 1:many"

    Country ||--o{ Region : "1:many"
    Region ||--o{ City : "1:many"
    City ||--o{ County : "1:many"

    Seller }o--|| Country : "many:1"
    Seller }o--|| Region : "many:1"
    Seller }o--|| City : "many:1"
    Seller }o--|| County : "many:1"
    Seller }o--|| UserCategory : "many:1"

    Department ||--o{ DepartmentCategory : "1:many"
    DepartmentCategory ||--o{ ProductCategory : "1:many"
    ProductCategory ||--o{ Product : "1:many"

    MaterialImpactEstimate ||--o{ ProductCategory : "first 1:many"
    MaterialImpactEstimate ||--o{ ProductCategory : "second 1:many"
    MaterialImpactEstimate ||--o{ ProductCategory : "third 1:many"
    MaterialImpactEstimate ||--o{ ProductCategory : "fourth 1:many"
    MaterialImpactEstimate ||--o{ ProductCategory : "fifth 1:many"

    Product ||--o{ ProductLike : "1:many"
    Product ||--o{ ProductComment : "1:many"
    Product ||--o{ Chat : "1:many"
    Product ||--o{ OrderItem : "1:many"
    Product ||--o{ Exchange : "offered 1:many"
    Product ||--o{ Exchange : "requested 1:many"

    Order ||--o{ OrderItem : "1:many"
    ShippingStatus ||--o{ Order : "1:many"

    Transaction ||--|| Exchange : "1:1"

    Chat ||--o{ Message : "1:many"
```

## Foreign Key Relationships Detail

### **Seller Table Foreign Keys**

- `cityId` → City.id
- `countryId` → Country.id
- `countyId` → County.id
- `regionId` → Region.id
- `userCategoryId` → UserCategory.id

### **Profile Tables Foreign Keys**

- `PersonProfile.sellerId` → Seller.id (CASCADE DELETE)
- `StoreProfile.sellerId` → Seller.id (CASCADE DELETE)

### **Location Hierarchy Foreign Keys**

- `Region.countryId` → Country.id
- `City.regionId` → Region.id
- `County.cityId` → City.id

### **Product System Foreign Keys**

- `Product.sellerId` → Seller.id
- `Product.productCategoryId` → ProductCategory.id
- `ProductCategory.departmentCategoryId` → DepartmentCategory.id
- `DepartmentCategory.departmentId` → Department.id
- `ProductCategory.[1-5]MaterialTypeId` → MaterialImpactEstimate.id

### **Commerce Foreign Keys**

- `Order.sellerId` → Seller.id (buyer)
- `Order.shippingStatusId` → ShippingStatus.id
- `OrderItem.orderId` → Order.id
- `OrderItem.productId` → Product.id
- `Transaction.sellerId` → Seller.id
- `Exchange.transactionId` → Transaction.id
- `Exchange.offeredProductId` → Product.id
- `Exchange.requestedProductId` → Product.id

### **Communication Foreign Keys**

- `Chat.senderId` → Seller.id
- `Chat.receiverId` → Seller.id
- `Chat.productId` → Product.id (optional)
- `Message.chatId` → Chat.id
- `Message.senderId` → Seller.id

### **Social Foreign Keys**

- `Match.senderId` → Seller.id
- `Match.receiverId` → Seller.id
- `Story.sellerId` → Seller.id

### **Authentication Foreign Keys**

- `Session.sellerId` → Seller.id

### **Interaction Foreign Keys**

- `ProductLike.productId` → Product.id
- `ProductLike.sellerId` → Seller.id
- `ProductComment.productId` → Product.id
- `ProductComment.sellerId` → Seller.id

## Index Strategy Recommendations

### **Primary Indexes** (Already defined)

- All PK fields are automatically indexed
- UK fields (email, token, barcode) are automatically indexed

### **Recommended Additional Indexes**

```sql
-- Performance indexes for common queries
CREATE INDEX idx_seller_type ON Seller(sellerType);
CREATE INDEX idx_seller_location ON Seller(cityId, countryId);
CREATE INDEX idx_product_seller ON Product(sellerId);
CREATE INDEX idx_product_category ON Product(productCategoryId);
CREATE INDEX idx_product_active ON Product(isActive);
CREATE INDEX idx_product_condition ON Product(condition);
CREATE INDEX idx_order_seller ON Order(sellerId);
CREATE INDEX idx_chat_participants ON Chat(senderId, receiverId);
CREATE INDEX idx_message_chat ON Message(chatId);
CREATE INDEX idx_transaction_seller ON Transaction(sellerId);

-- Composite indexes for complex queries
CREATE INDEX idx_product_seller_active ON Product(sellerId, isActive);
CREATE INDEX idx_chat_product ON Chat(productId) WHERE productId IS NOT NULL;
```

This technical schema shows every foreign key relationship and provides a complete picture of how your ecommerce platform data is interconnected!
