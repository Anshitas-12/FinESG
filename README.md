# FinESG

AI-powered ESG (Environmental, Social, Governance) analysis and reporting platform using a fine-tuned language model.

![Tech Stack](https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)

## Demo Video

**[Watch Project Demo →](https://drive.google.com/file/d/1n42Kd0tII9I_ffvbipOVBRDgBvLv04f_/view?usp=sharing)**

## Features

- **AI-Powered Analysis** - ESG-specialized language model (finesg4)
- **PDF Upload** - Analyze annual reports and financial documents
- **Chat Interface** - Multi-turn conversations with context awareness
- **Secure Authentication** - JWT-based login with demo mode
- **Persistent Storage** - SQLite database for conversation history
- **Fast Inference** - 150+ tokens/sec using LM Studio

## Quick Start

### Prerequisites

- **Java** 21+
- **Maven** (or use the included `mvnw` wrapper)
- **Node.js** 18+
- **LM Studio** (for AI model serving)
- **Git**

### 1. Clone Repository

```bash
git clone <repository-url>
cd FinESG
```

### 2. Backend Setup

```bash
# Run backend server using the Maven wrapper
./mvnw spring-boot:run
```

Backend will start on **<http://localhost:8080>**

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will start on **<http://localhost:5173>**

### 4. LM Studio Setup & finesg4 Model

#### Option A: Quick Start (Use Base Model)

1. **Download & Install** [LM Studio](https://lmstudio.ai/)
2. **Download Model**: Search for "Qwen 2.5-1.5B-Instruct" in LM Studio
3. **Load Model** in Chat tab
4. **Start Local Server** on port 1234

#### Option B: Use Fine-Tuned ESG Model (Recommended)

##### Step 1: Download finesg4 Model

**Download our pre-converted GGUF model:**

**[Download finesg4.gguf from Google Drive](https://drive.google.com/file/d/1fe995X-uJfJCgHq48QltGuukWTxrw9q8/view?usp=sharing)** (~3.1GB)

> **Note**: This is our custom ESG-specialized model, fine-tuned on financial and sustainability reporting data.

##### Step 2: Import to LM Studio (CRITICAL: Folder Structure)

LM Studio requires a **double-nested folder structure**:

```
C:\Users\<YourName>\.lmstudio\models\
└── finesg4\              # Parent folder
    └── finesg4\          # Child folder (same name!)
        └── finesg4.gguf  # Your model file
```

**Manual Setup:**

```bash
# Navigate to LM Studio models directory
cd "C:\Users\<YourName>\.lmstudio\models"

# Create parent folder
mkdir finesg4

# Create child folder (same name)
mkdir finesg4\finesg4

# Copy your GGUF file into the nested folder
copy "C:\path\to\llama.cpp\finesg4.gguf" "finesg4\finesg4\finesg4.gguf"
```

**Step 3: Load in LM Studio**

1. **Restart LM Studio** completely (close and reopen)
2. **Go to "My Models" tab** - you should now see `finesg4`
3. **Click "Chat" tab** → Select `finesg4` from dropdown
4. **Go to "Local Server" tab** → Click "Start Server" (port 1234)
5. **Verify**: Status should show "Running" with model name `finesg4`

> **Troubleshooting**: If model doesn't appear, verify the folder structure is exactly: `models\finesg4\finesg4\finesg4.gguf`

## Tech Stack

### Frontend

- **React** 18 + TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library

### Backend

- **Spring Boot** - Web framework
- **Spring Data JPA** - ORM
- **SQLite** - Database
- **Spring AI** - AI/LLM integration

### AI/ML

- **LM Studio** - Model serving
- **finesg4** - ESG-specialized model
- **Qwen 2.5-1.5B** - Base model

See [TECH_STACK.md](./TECH_STACK.md) for complete details.

## Project Structure

```
FinESG/
├── src/                    # Backend (Spring Boot)
│   ├── controller/         # API routes
│   ├── model/              # Database models
│   ├── dto/                # DTOs
│   ├── repository/         # Database operations
│   ├── security/            # Authentication
│   └── service/             # LM Studio integration
├── frontend/              # Frontend (React)
│   ├── src/
│   │   ├── components/    # React components
│   │   └── contexts/      # State management
│   └── package.json
├── pom.xml                # Maven dependencies
└── README.md
```

## Configuration

### Environment Variables (Optional)

Create `application.properties` file in resources:

```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=jdbc:sqlite:./finesg.db
```

### Default Credentials (Demo Mode)

- **Email**: <demo@example.com>
- **Password**: demo123

## Performance

| Metric | Value |
|--------|-------|
| Inference Speed | 150+ tokens/sec |
| Response Time | 2-3 seconds |
| Memory Usage | ~2GB VRAM |
| Model Size | 900MB (quantized) |

## Use Cases

- ESG report analysis
- Sustainability reporting
- Financial document review
- Compliance checking
- Corporate governance analysis

## Security

- JWT token authentication
- HTTPOnly cookies
- Password hashing (bcrypt)
- Parameterized SQL queries
- CORS configuration

## Contributing

Contributions welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## Acknowledgments

- **Qwen Team** - Base language model
- **LM Studio** - Optimized inference engine
- **Spring Boot** - Modern Java web framework
- **shadcn/ui** - Beautiful component library

## Contact

For questions or support, please open an issue on GitHub.

---

**Built with care for ESG Analysis**

*Making sustainability reporting accessible and efficient*
