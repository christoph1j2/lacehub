# LaceHub - Curate Your Kicks

![LaceHub Logo](ui/public/images/logo.ico)

> **Your personal inventory for the world's most sought-after sneakers. Track, match, and trade with the community.**

LaceHub is a comprehensive web platform designed to connect sneaker enthusiasts across Europe through an automated matching system. Whether you're looking to buy or sell, LaceHub streamlines the process by automatically connecting buyers and sellers based on their Want-to-Buy and Want-to-Sell lists.

## 🚀 Features

### For Sellers

- **Inventory Management**: Upload and manage your sneaker collection with SKU codes and sizes
- **Want-to-Buy Lists**: Create lists of sneakers you're looking to purchase
- **Bulk Import**: Support for Excel spreadsheet imports
- **Match Notifications**: Get notified when buyers are looking for your inventory
- **Profile Management**: Track your activity and build credibility

### For Buyers

- **Want-to-Buy Lists**: Create detailed wish lists of desired sneakers
- **Automatic Matching**: Our algorithm matches your requests with seller inventories
- **Email Notifications**: Receive alerts when your desired sneakers become available
- **Size & SKU Matching**: Precise matching based on exact specifications

### Platform Features

- **Automated Matching System**: Smart algorithm compares SKU codes and sizes
- **User Profiles**: Activity tracking and credibility scoring
- **Secure Authentication**: JWT-based authentication with email verification
- **RESTful API**: Comprehensive API for all platform operations
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Technology Stack

### Backend (API)

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, Rate limiting
- **Email**: Nodemailer for notifications
- **Testing**: Jest for unit and e2e tests

### Frontend (UI)

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Icons**: Heroicons & Lucide React
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast & Sonner
- **Charts**: Recharts for analytics
- **Build Tools**: Vite for fast development and building

### DevOps & Infrastructure

- **Containerization**: Docker & Docker Compose
- **Environment Management**: Multiple environment configs (development, production)
- **Database Schema**: Comprehensive entity relationships
- **API Documentation**: Postman collections included

## 📁 Project Structure

```text
lacehub/
├── api/                          # Backend NestJS application
│   ├── src/
│   │   ├── auth/                # Authentication module
│   │   ├── users/               # User management
│   │   ├── products/            # Sneaker product catalog
│   │   ├── matches/             # Matching algorithm
│   │   ├── notifications/       # Email notifications
│   │   ├── user-inventory/      # User inventory management
│   │   ├── wtb/                 # Want-to-Buy lists
│   │   ├── wts/                 # Want-to-Sell lists
│   │   ├── reviews/             # User reviews system
│   │   ├── reports/             # Reporting system
│   │   └── entities/            # Database entities
│   ├── misc/                    # API documentation & DB schema
│   └── test/                    # Test files
└── ui/                          # Frontend React application
    ├── src/
    │   ├── components/          # Reusable UI components
    │   ├── pages/               # Page components
    │   ├── services/            # API service layer
    │   ├── hooks/               # Custom React hooks
    │   └── layout/              # Layout components
    └── public/                  # Static assets
```

## 📊 Database Schema

The project includes a comprehensive database schema with the following main entities:

- **Users**: User accounts with authentication
- **Products**: Sneaker catalog with SKU codes
- **UserInventory**: User's sneaker collections
- **WTB (Want-to-Buy)**: Buyer wish lists
- **WTS (Want-to-Sell)**: Seller listings
- **Matches**: Automated matching results
- **Notifications**: Email notification system
- **Reviews**: User feedback system
- **Reports**: User reporting system

## 🔧 API Documentation

The API is fully documented with Swagger/OpenAPI. When running in development mode, access the documentation at:

```text
http://localhost:3000/api
```

Postman collection is available in `api/misc/api_structure/`

## 🎨 UI Features

- **Responsive Design**: Optimized for all device sizes
- **Dark Theme**: Sleek dark interface with gradient accents
- **Interactive Animations**: Smooth transitions and hover effects
- **SEO Optimized**: Automatic sitemap generation
- **User Guides**: Comprehensive how-it-works pages

## 👥 Team & Contributions

This project was developed as a graduation project by three students:

### Bui Dai Duong - Frontend Developer

**Responsibilities:**

- UI/UX design and implementation
- React component development
- Responsive design with Tailwind CSS
- SEO optimization and sitemap generation
- User guide and documentation pages
- Frontend routing and state management

**Key Contributions:**

- Homepage with animated hero section
- User authentication forms
- Dashboard interfaces
- How-it-works explanatory pages
- About-us team presentation
- Mobile-responsive navigation

### Ernst Christoph Leschka - Backend Developer

**Responsibilities:**

- NestJS API development
- Database design and modeling
- Authentication and security implementation
- Email notification system
- Unit and integration testing
- API documentation

**Key Contributions:**

- RESTful API with comprehensive endpoints
- JWT authentication with refresh tokens
- PostgreSQL database schema design
- Automated matching algorithm
- Email verification system
- Swagger API documentation

### Vojtěch Šebek - DevOps Engineer

**Responsibilities:**

- Server infrastructure setup
- Docker containerization
- Security implementation
- Monitoring and logging
- Backup systems
- Deployment pipelines

**Key Contributions:**

- Docker and Docker Compose configuration
- Production environment setup
- Security hardening and monitoring
- Database backup strategies
- CI/CD pipeline implementation
- Performance optimization

## 🎯 Future Roadmap

- **Mobile App**: Native iOS and Android applications
- **Enhanced Matching**: Advanced algorithm with preferences
- **Chat System**: In-app messaging between users
- **Payment Integration**: Secure payment processing
- **Reputation System**: Enhanced credibility scoring
- **Analytics Dashboard**: Detailed insights for sellers
- **European Expansion**: Multi-language support

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Email verification for new accounts
- Rate limiting and request throttling
- CORS protection
- Helmet security headers
- Password hashing with bcrypt
- SQL injection prevention with TypeORM

## 📈 Performance

- **Frontend**: Vite for lightning-fast development and optimized builds
- **Backend**: NestJS with efficient database queries
- **Caching**: Redis integration for improved performance
- **CDN Ready**: Optimized static asset delivery

## 🤝 Contributing

This is a graduation project, but we welcome feedback and suggestions. Please feel free to:

1. Open issues for bugs or feature requests
2. Submit pull requests for improvements
3. Provide feedback on user experience

## 📄 License

This project is part of a graduation thesis and is currently unlicensed. Please contact the team for usage permissions.

## 📞 Contact

For questions about this project, please reach out to the development team through the GitHub repository.

---

**LaceHub** - Connecting sneaker enthusiasts across Europe, one match at a time. 👟✨
