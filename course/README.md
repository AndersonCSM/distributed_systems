# Distributed Systems Course - Project Repository

This directory organizes practical activities from the distributed systems discipline in independent blocks. Each folder represents a project, with a focus on infrastructure, cloud, and frontend development.

## 📚 Projects Overview

| Project | Main Theme | README Documentation |
|---------|-----------|---------------------| 
| projeto_01 | Web Server on AWS EC2 with Apache | [README.md](projeto_01/README.md) |
| projeto_02 | Deploy React/Vite App on EC2 | [README.md](projeto_02/README.md) |
| projeto_03 | Distributed Architecture - WordPress + RDS | [README.md](projeto_03/README.md) |
| projeto_04 | AI Game using React + TypeScript + Tailwind | [README.md](projeto_04/README.md) |
| projeto_05 | Containerization Pipeline - Docker/ECR/ECS AWS | [README.md](projeto_05/README.md) |
| projeto_06 | Project Template | [README.md](projeto_06/README.md) |
| projeto_07 | Online Dominó - Full-stack Architecture | [README.md](projeto_07/README.md) |
| projeto_08 | Personal Portfolio | [README.md](projeto_08/README.md) |

## 🎯 Frontend Applications

Frontend applications are located in the following subfolders:

- [projeto_02/landpage](projeto_02/landpage) - React/Vite Landing Page
- [projeto_04/tetris](projeto_04/tetris) - Tetris/Snake variants
- [projeto_05/audio_player](projeto_05/audio_player) - Audio Player App (Docker containerized)
- [projeto_07/domino](projeto_07/domino) - Online Dominó Game (Full-stack)
- [projeto_08/portfolio](projeto_08/portfolio) - Personal Portfolio (React)

### Local Development Standard Flow

For any Node.js/React project:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build

```bash
# Generate optimized build
npm run build

# Preview production build locally
npm run preview
```

## 🐳 Docker & Containerization

Projects with Docker support:
- **projeto_05**: Complete Docker setup with multi-stage builds and AWS ECR/ECS deployment
- **projeto_07**: Docker Compose for multi-service full-stack architecture

Refer to each project's documentation for specific deployment instructions.

## 📋 Important Notes

- Each project documentation includes step-by-step procedures and expected results
- Always validate network rules (ports 22, 80, 443, and 3306 when applicable) before external testing
- Consult project-specific documentation for detailed deployment information
- Refer to individual project READMEs for architecture diagrams and setup guides

## 🔗 Quick Links

- [Main Repository README](../README.md) - Repository overview
- [Project Documentation](../docs/) - Additional technical documentation

## 👤 Author

Anderson Carlos da Silva Morais - 2024011327

**Last Updated:** May 2, 2026
