# Harmonix Studio

> Transforma música em partitura e partitura em música (fluxo bidirecional).

## Manifesto do projeto

O **Harmonix Studio** existe para reduzir a distância entre ideia musical, áudio e notação.
Nosso objetivo é permitir que estudantes, músicos e produtores convertam conteúdo musical entre formatos de forma rápida e prática.

### Objetivo principal

- **Áudio → Partitura**: transcrever música para estrutura musical editável.
- **Partitura/Imagem → Estrutura musical**: ler partitura/tab/cifra e representar em JSON musical.
- **Estrutura musical → Reprodução**: tocar a música de volta no app com controle por trilha.

## Escopo atual (auditado)

### O que já funciona

- API server em TypeScript com endpoints para:
  - `POST /api/transcribe-audio`
  - `POST /api/ocr-score`
  - `POST /api/search-music-info`
- Fallback local quando a chave Gemini não está configurada.
- Estrutura de score com metadados (BPM, tom, compasso, tracks, notas).

### Limitações atuais

- Parte dos resultados é sintética/fallback e pode não refletir fielmente o áudio real.
- Reconhecimento por nome de arquivo em casos específicos (ex.: Tears in Heaven) precisa ser tratado como demo, não como OCR universal.
- Ausência de suíte de testes automatizados para validar regressões dos endpoints.

## Metas de qualidade

- Retornar estruturas de partitura consistentes e válidas para qualquer endpoint.
- Evitar crashes com payloads grandes e MIME inconsistentes.
- Reduzir respostas “hardcoded” e aumentar previsibilidade dos fallbacks.

## Requisitos de ambiente

Crie um arquivo `.env` com:

```bash
GEMINI_API_KEY=sua_chave
PORT=3000
```

## Como rodar

```bash
npm install
npm run dev
```

Servidor disponível em `http://localhost:3000`.

## Próximos passos recomendados

1. Adicionar testes de contrato para os 3 endpoints.
2. Introduzir validação de payload no servidor (zod/yup).
3. Formalizar níveis de confiança nas transcrições (confidence score).
4. Implementar exportação para MusicXML/MIDI como saída padrão de interoperabilidade.
