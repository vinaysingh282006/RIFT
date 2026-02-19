# PharmaGuard - AI-Powered Pharmacogenomic Risk Prediction Platform

<div align="center">

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-v18.3.1-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-v5.4.19-blue.svg)](https://vitejs.dev/)

**AI-Powered Pharmacogenomic Risk Prediction for the RIFT 2026 Precision Medicine Hackathon**

</div>

## 🚀 Live Demo

[Live Demo Link](https://pharmaguard.vercel.app) • [LinkedIn Demo Video](https://linkedin.com/demo-video) • [Architecture Diagram](#architecture-diagram)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Usage Examples](#usage-examples)
- [Team Details](#team-details)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Overview

PharmaGuard is a cutting-edge pharmacogenomics platform that leverages artificial intelligence to analyze patient genetic data and predict drug metabolism profiles. Our system provides personalized medication recommendations based on clinical guidelines, helping clinicians optimize drug therapy and minimize adverse reactions.

The platform addresses critical challenges in precision medicine by translating complex genetic variants into actionable clinical insights, supporting evidence-based decision-making at the point of care.

## ✨ Key Features

### Clinical Credibility
- **Evidence Source Badges**: Visual indicators for CPIC guidelines, PharmGKB evidence levels, and FDA pharmacogenomic labeling
- **Biological Mechanism Explanations**: Detailed pathways from variant detection to clinical effect
- **Phenotype Reasoning**: Variant coverage completeness, confidence justification, and annotation reliability

### Advanced VCF Processing
- **Robust VCF Parser**: Handles missing INFO tags, incorrect formatting, multiple patients, partial annotations, and variant normalization
- **Gene-Specific Filtering**: Early filtering for key pharmacogenes (CYP2D6, CYP2C19, CYP2C9, SLCO1B1, TPMT, DPYD)
- **Efficient Data Processing**: Optimized for performance with minimal compute overhead

### AI-Powered Insights
- **Structured AI Prompting**: Variant → Gene function → Drug metabolism → Clinical recommendation flow
- **Dual Clinical Modes**: Technical terminology for physicians, simplified language for patients
- **Caching System**: Reduces latency with cached parsed VCF results and explanation outputs

### User Experience Excellence
- **Analysis Pipeline Visualization**: Step-by-step visualization of Upload → Variant Detection → Gene Interpretation → Drug Risk → Recommendation
- **Medical-Grade Confidence Scoring**: Detailed breakdown of confidence metrics
- **Drug Comparison Views**: Side-by-side risk assessment for multiple medications
- **Interactive Glossary**: Hover definitions for complex terms (diplotype, phenotype, metabolizer)

### Production-Ready Infrastructure
- **Comprehensive Error Handling**: Graceful handling of invalid formats, unsupported drugs, and missing data
- **Strict JSON Schema Compliance**: Standardized output with all required fields
- **Export Functionality**: Copy and download JSON reports

## 🛠️ Tech Stack

### Frontend Framework
- **React 18**: Component-based UI architecture with concurrent rendering
- **TypeScript 5**: Strong typing for enhanced code quality and maintainability
- **Vite 5**: Next-generation build tool for lightning-fast development

### Styling & UI Components
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **shadcn/ui**: Accessible UI components built with Radix UI and Tailwind CSS
- **Framer Motion**: Production-ready animation library for React

### Icons & Graphics
- **Lucide React**: Consistent icon library with medical and scientific imagery

### State Management
- **TanStack Query**: Server state management and caching solution

### Routing
- **React Router DOM**: Declarative routing for SPAs

### Testing
- **Vitest**: Fast test runner powered by Vite
- **Testing Library**: Utilities for testing React components

### Development Tools
- **ESLint**: Static analysis and code quality enforcement
- **TypeScript ESLint**: TypeScript-specific linting rules

## 🏗️ Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   VCF Upload    │───▶│  VCF Parser     │───▶│   Variant       │
│   Component     │    │  & Validator    │    │   Detection     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                         │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Gene Interp.  │◀───│  Phenotype      │───▶│   Drug Risk     │
│   Component     │    │  Calculator     │    │   Scoring       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                         │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Clinical      │◀───│  AI Service     │───▶│   Recommendation│
│   Dashboard     │    │  & Explanations │    │   Generator     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Core Modules

#### 1. VCF Parser (`src/lib/vcfParser.ts`)
- Robust parsing of VCF v4.2 files
- Gene-specific filtering for pharmacogenes
- Error handling for malformed files
- Performance optimization with early filtering

#### 2. AI Service (`src/lib/aiService.ts`)
- Structured prompting for variant interpretation
- Dual mode support (doctor/patient)
- Caching for improved performance
- Evidence-based recommendations

#### 3. JSON Schema (`src/lib/jsonSchema.ts`)
- Strict schema validation
- Compliant output generation
- Quality metrics calculation
- Error reporting

#### 4. UI Components
- **AnalysisPipeline**: Visual representation of processing steps
- **RiskAssessmentPanel**: Primary drug risk visualization
- **ClinicalRecommendation**: Evidence-based recommendations
- **RiskComparisonTable**: Multi-drug comparison view
- **PharmacogenomicProfile**: Patient genetic profile summary
- **AIExplanation**: Natural language explanations
- **JsonOutputPanel**: Export functionality

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18.0.0 or higher
- npm or yarn package manager
- Git version control system

### Installation Steps

1. **Clone the Repository**
```bash
git clone https://github.com/your-team/pharmaguard.git
cd pharmaguard
```

2. **Install Dependencies**
```bash
npm install
# or
yarn install
```

3. **Environment Variables** (if applicable)
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. **Development Server**
```bash
npm run dev
# or
yarn dev
```

5. **Build for Production**
```bash
npm run build
# or
yarn build
```

6. **Preview Production Build**
```bash
npm run preview
# or
yarn preview
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Create production build |
| `npm run build:dev` | Create development build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |

## 📚 API Documentation

### VCF Parser API
```typescript
interface VCFParser {
  parseVcf(content: string, targetGenes: string[]): Promise<VcfParseResult>
  validateVcfFormat(content: string): ValidationResult
}
```

### AI Service API
```typescript
interface AIService {
  generateExplanation(params: AIPromptParams): Promise<AIExplanationResponse>
  getCachedExplanation(params: AIPromptParams): Promise<AIExplanationResponse>
}
```

### JSON Schema API
```typescript
interface JSONValidator {
  validatePGxResult(result: any): ValidationResult
  transformToCompliantJSON(internalResult: any, patientId?: string, vcfFilename?: string): PGxAnalysisResult
}
```

## 💡 Usage Examples

### Example 1: Basic VCF Analysis
```typescript
import { parseVcf } from '@/lib/vcfParser';

const vcfContent = `##fileformat=VCFv4.2
#CHROM	POS	ID	REF	ALT	QUAL	FILTER	INFO
chr22	42522500	rs3892097	G	A	.	.	.
`;

const result = await parseVcf(vcfContent, ['CYP2D6']);
console.log(result.records); // Parsed variants for CYP2D6 gene
```

### Example 2: AI-Generated Explanation
```typescript
import { AIService } from '@/lib/aiService';

const explanation = await AIService.getCachedExplanation({
  variant: { rsid: 'rs3892097', gene: 'CYP2D6', zygosity: 'Homozygous', genotype: '1/1', effect: 'Loss of function' },
  drug: 'CODEINE',
  gene: 'CYP2D6',
  diplotype: '*4/*4',
  phenotype: 'Poor Metabolizer (PM)',
  clinicalMode: 'doctor',
  evidenceSources: ['cpic', 'pharmgkb', 'fda']
});
```

### Example 3: JSON Output Generation
```typescript
import { transformToCompliantJSON } from '@/lib/jsonSchema';

const compliantOutput = transformToCompliantJSON(mockResult, 'PATIENT-001', 'sample.vcf');
```

## 👥 Team Details

### Development Team
- **Lead Developer**: [Your Name]
- **Frontend Specialist**: [Team Member Name]
- **AI/ML Engineer**: [Team Member Name]
- **DevOps Engineer**: [Team Member Name]

### Contact Information
- **Email**: team@pharmaguard.example.com
- **GitHub**: [github.com/your-team](https://github.com/your-team)
- **LinkedIn**: [linkedin.com/company/pharmaguard](https://linkedin.com/company/pharmaguard)

## 🤝 Contributing

We welcome contributions to PharmaGuard! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Maintain consistent code style (enforced by ESLint)
- Document breaking changes in pull requests

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built for the RIFT 2026 Precision Medicine Algorithm Track**

*Clinical accuracy • Explainable AI • Fast response • Professional UI • Stable deployment*

</div>