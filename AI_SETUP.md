# Local AI Setup Guide

Your Family Creative Platform now runs on **home compute AI** - completely private, no API costs, full control!

## Quick Start (5 Minutes)

### 1. Install Ollama

**Mac:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Download from https://ollama.com/download

### 2. Pull an AI Model

Choose one (or try multiple):

**Llama 3 (Recommended - Best overall):**
```bash
ollama pull llama3
```

**CodeLlama (Best for coding):**
```bash
ollama pull codellama
```

**Mistral (Fast and capable):**
```bash
ollama pull mistral
```

**Phi-3 (Lightweight, good for older hardware):**
```bash
ollama pull phi3
```

### 3. Start Ollama

Ollama runs automatically in the background on port 11434. If not:

```bash
ollama serve
```

### 4. Configure in App

1. Click the **Settings** ⚙️ icon in the header
2. Test connection (should show green checkmark)
3. Select your preferred model
4. Adjust temperature/tokens if desired
5. Save settings

## Using AI in Chat

### Method 1: @AI Mentions
In any chat thread, type `@AI` followed by your question:
```
@AI Help me plan a platformer game
```

### Method 2: AI Threads
Create or use existing AI-type threads for focused conversations.

### Method 3: Automatic
AI threads automatically respond to all messages.

## What You Can Do

### Game Development
```
@AI Create a simple Pong game structure
@AI How do I add collision detection in JavaScript?
@AI Review this game loop code: [paste code]
```

### Homework Help
```
@AI Explain photosynthesis for a 5th grader
@AI Help me solve this math problem: 2x + 5 = 15
```

### Creative Writing
```
@AI Generate a fantasy story about a dog astronaut
@AI Help me brainstorm character ideas
```

### Code Generation
AI automatically detects code blocks and applies syntax highlighting:
```
@AI Write a function to sort an array

Response includes:
```javascript
function sortArray(arr) {
  return arr.sort((a, b) => a - b);
}
```

## Features

- **Streaming Responses** - See AI type in real-time
- **Context Aware** - AI knows about your projects and thread context
- **Code Highlighting** - Automatic syntax highlighting in responses
- **Conversation Memory** - AI remembers last 10 messages in thread
- **Voice Input** - Record voice messages that AI can respond to
- **Multi-User** - Each family member has their own conversations

## Model Comparison

| Model | Best For | Speed | Quality | Size |
|-------|----------|-------|---------|------|
| llama3 | General use | Medium | High | 4.7GB |
| codellama | Programming | Medium | Very High (code) | 3.8GB |
| mistral | Quick responses | Fast | Good | 4.1GB |
| phi3 | Older hardware | Very Fast | Good | 2.3GB |

## Performance Tips

### For Better Responses:
- **Higher temperature (0.8-1.0)** = More creative responses
- **Lower temperature (0.3-0.5)** = More focused, deterministic responses
- **More tokens (3000+)** = Longer responses
- **Fewer tokens (1000-2000)** = Quicker, concise responses

### For Faster Responses:
1. Use smaller models (phi3, mistral)
2. Lower max tokens
3. Close other programs
4. Use GPU if available (automatically detected)

### Hardware Requirements:
- **Minimum:** 8GB RAM, any modern CPU
- **Recommended:** 16GB RAM, GPU
- **Optimal:** 32GB+ RAM, NVIDIA GPU

## Advanced Configuration

### Custom Endpoint
If running Ollama on a different machine:
```
http://192.168.1.100:11434
```

### Run Multiple Models
```bash
ollama pull llama3
ollama pull codellama
```
Switch between them in Settings.

### GPU Acceleration
Ollama automatically uses your GPU if available (NVIDIA/AMD/Apple Silicon).

## Troubleshooting

### "Cannot connect to AI server"
1. Check Ollama is running: `ollama list`
2. Verify endpoint: http://localhost:11434
3. Restart Ollama: `killall ollama && ollama serve`

### "Model not found"
Pull the model first: `ollama pull llama3`

### Slow Responses
1. Try a smaller model (phi3)
2. Reduce max tokens in settings
3. Check CPU/memory usage

### Out of Memory
1. Use phi3 (smallest model)
2. Reduce max tokens
3. Close other applications

## Privacy & Security

**Everything runs locally:**
- No data sent to cloud
- No API keys needed
- No internet required (after model download)
- Complete privacy for family conversations

## Cost Analysis

**Traditional Cloud AI:**
- OpenAI: $0.03-$0.06 per 1K tokens
- Claude: $0.015-$0.075 per 1K tokens
- Monthly family usage: $50-200+

**Your Home AI:**
- One-time setup: Free
- Monthly cost: $0
- Unlimited usage
- Full privacy

## Next Steps

1. Try different models to find your favorite
2. Experiment with temperature settings
3. Create dedicated AI threads for different topics
4. Use voice input for quick questions
5. Share code snippets for review and help

## Support

Having issues? Check:
1. Ollama docs: https://ollama.com/docs
2. Model library: https://ollama.com/library
3. GitHub issues: https://github.com/ollama/ollama/issues

---

**You now have a powerful AI assistant running on your own hardware, completely private and free to use!**
