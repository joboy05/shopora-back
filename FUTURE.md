# Shopora 2.0: Backend Roadmap

This document outlines the progressive steps to evolve Shopora into a high-performance, extensible e-commerce platform inspired by Shopify 2.0.

## Phase 1: The Transactional Core (Immediate Focus)
The current server handles administration (Markets, Catalogs, Themes) but lacks the core of commerce.
- [ ] **Product Engine**: Implement `Product` and `ProductVariant` models with support for complex options (size, color, etc.).
- [ ] **Inventory System**: Track stock levels across different locations.
- [ ] **Collections**: Group products dynamically (by tags/rules) or manually.
- [ ] **Media Handling**: Efficient storage and delivery of product images and videos.

## Phase 2: Checkout & Order Management
Transforming views into transactions.
- [ ] **Cart API**: High-performance, temporary storage for customer intent.
- [ ] **Checkout Logic**: Tax calculation (using existing `TaxRule`), shipping rates, and discount engine.
- [ ] **Order Lifecycle**: From `Draft` to `Paid`, `Fulfilled`, and `Archived`.
- [ ] **Customer Service**: API endpoints for customer profiles and order history.

## Phase 3: Extensibility & Metadata
Building a platform, not just a store.
- [ ] **Metaobjects**: Custom data structures (like Shopify's) allowing merchants to define their own concepts.
- [ ] **Webhooks**: Event-driven architecture to notify external services (apps).
- [ ] **API Versioning**: Ensuring stability for future "Shopora App" developers.

## Phase 4: Intelligence & Global Scale
- [ ] **Analytics 2.0**: Advanced reporting on conversion rates, AOV, and customer LTV.
- [ ] **Automations**: Internal workflow engine (e.g., "if stock < 5, notify admin").
- [ ] **Multi-currency**: Dynamic pricing based on `Market` settings.
