import { DocumentItem, QAInteraction } from '../types';

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-vaswani-2017',
    title: 'Attention Is All You Need',
    author: 'A. Vaswani, N. Shazeer, N. Parmar, et al.',
    source: 'NeurIPS 2017 / Google Brain & Google Research',
    pageCount: 15,
    summary:
      'Proposes the Transformer, the first sequence transduction model based entirely on self-attention mechanisms, eliminating recurrent and convolutional networks entirely.',
    coverColor: '#9E4736', // Terracotta
    coverPattern: 'geometric',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    totalQuestions: 4,
    groundingScoreAvg: 96,
    unsupportedClaimsCount: 0,
    isSaved: true,
    chunks: [
      {
        id: 'doc-vaswani-c1',
        chunkIndex: 1,
        page: 1,
        sectionTitle: 'Abstract & Introduction',
        text: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The Transformer relies entirely on an attention mechanism to draw global dependencies between input and output. The Transformer allows for significantly more parallelization and can reach a new state of the art in translation quality after being trained for as little as twelve hours on eight P100 GPUs.',
      },
      {
        id: 'doc-vaswani-c2',
        chunkIndex: 2,
        page: 3,
        sectionTitle: 'Scaled Dot-Product & Multi-Head Attention',
        text: 'We compute the attention function on a set of queries simultaneously, packed together into a matrix Q. The keys and values are also packed into matrices K and V. We compute the matrix of outputs as: Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k)) V. We found it beneficial to linearly project the queries, keys, and values h times with different, learned linear projections to d_k, d_k and d_v dimensions. Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions.',
      },
      {
        id: 'doc-vaswani-c3',
        chunkIndex: 3,
        page: 5,
        sectionTitle: 'Positional Encoding & Residuals',
        text: 'Since our model contains no recurrence and no convolution, in order for the model to make use of the order of the sequence, we must inject some information about the relative or absolute position of the tokens in the sequence. To this end, we add positional encodings to the input embeddings at the bottoms of the encoder and decoder stacks. We use sine and cosine functions of different frequencies.',
      },
      {
        id: 'doc-vaswani-c4',
        chunkIndex: 4,
        page: 8,
        sectionTitle: 'Training Efficiency & BLEU Benchmarks',
        text: 'On the WMT 2014 English-to-German translation task, the big transformer model outperforms the best previously reported models (including ensembles) by more than 2.0 BLEU, establishing a new state-of-the-art BLEU score of 28.4. Training took 3.5 days on 8 NVIDIA P100 GPUs, a small fraction of the training costs of competitive models from the literature.',
      },
    ],
  },
  {
    id: 'doc-bubeck-2023',
    title: 'Sparks of AGI: Early Experiments with GPT-4',
    author: 'S. Bubeck, V. Chandrasekaran, R. Eldan, et al.',
    source: 'Microsoft Research / arXiv:2303.12712',
    pageCount: 154,
    summary:
      'Investigates an early version of OpenAI GPT-4 across novel reasoning tasks, concluding that it demonstrates significant general intelligence across disciplines while identifying core architectural bounds.',
    coverColor: '#3B4B69', // Academic Navy
    coverPattern: 'stripes',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
    totalQuestions: 6,
    groundingScoreAvg: 88,
    unsupportedClaimsCount: 1,
    isSaved: true,
    chunks: [
      {
        id: 'doc-bubeck-c1',
        chunkIndex: 1,
        page: 2,
        sectionTitle: 'Core Thesis & Intelligence Definition',
        text: 'We demonstrate that, beyond its mastery of language, GPT-4 can solve novel and difficult tasks that span mathematics, coding, vision, medicine, law, psychology and more, without requiring any special prompting. Moreover, in all of these tasks, GPT-4’s performance is strikingly close to human-level performance, and often vastly surpasses prior models such as ChatGPT.',
      },
      {
        id: 'doc-bubeck-c2',
        chunkIndex: 2,
        page: 18,
        sectionTitle: 'Mathematical Reasoning & Coding',
        text: 'GPT-4 displays a high level of mathematical competence, solving competition-level math problems from the AMC and olympiad preliminaries. In software development, it can generate end-to-end 3D video games in JavaScript with HTML5 Canvas, implement complex data structures, and debug distributed systems code, synthesizing solutions across APIs and libraries.',
      },
      {
        id: 'doc-bubeck-c3',
        chunkIndex: 3,
        page: 44,
        sectionTitle: 'Limitations: Planning & Working Memory',
        text: 'GPT-4’s autoregressive next-token architecture has intrinsic limitations. It lacks an internal working memory to backtrack, look ahead, or verify long-horizon plans. When an erroneous token is generated in a multi-step proof or navigation problem, the model continues forward confidently, often compounding errors (hallucinations). It does not maintain a continuous live representation of world state.',
      },
      {
        id: 'doc-bubeck-c4',
        chunkIndex: 4,
        page: 72,
        sectionTitle: 'Theory of Mind & Safety',
        text: 'GPT-4 demonstrates nuanced Theory of Mind in simulated social scenarios, predicting how different individuals would interpret ambiguously worded emails or deceptive behaviors. However, we also note vulnerabilities to prompt injection, sycophancy (agreeing with user misconceptions), and lack of real-time grounding in external truth.',
      },
    ],
  },
  {
    id: 'doc-nature-sustainability',
    title: 'The Carbon and Water Footprint of AI',
    author: 'P. Henderson, J. Luccioni, S. Lu, et al.',
    source: 'Nature Electronics & Environmental Computing',
    pageCount: 22,
    summary:
      'Quantifies the lifecycle resource usage of training and inference workloads, evaluating the water evaporation from cooling towers and carbon intensity across global grid regions.',
    coverColor: '#3D5A50', // Forest Sage
    coverPattern: 'dots',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
    totalQuestions: 3,
    groundingScoreAvg: 100,
    unsupportedClaimsCount: 0,
    isSaved: false,
    chunks: [
      {
        id: 'doc-nature-c1',
        chunkIndex: 1,
        page: 1,
        sectionTitle: 'Abstract: The Hidden Resource Demands',
        text: 'While the energy consumption of training large models has received scrutiny, the operational water footprint and regional carbon displacement of high-frequency inference remain underexplored. We find that training a 175B-parameter model can consume upwards of 700,000 liters of freshwater for on-site evaporative cooling in humid continental data centers.',
      },
      {
        id: 'doc-nature-c2',
        chunkIndex: 2,
        page: 6,
        sectionTitle: 'Inference Water Footprint per Prompt',
        text: 'A median session involving 20-50 queries to a frontier LLM directly evaporates between 500 milliliters and 2 liters of potable water when servers rely on cooling towers. The Scope 2 water footprint varies by a factor of 4.2 depending on whether the local electric grid relies on hydroelectric reservoirs or closed-loop nuclear/wind.',
      },
      {
        id: 'doc-nature-c3',
        chunkIndex: 3,
        page: 14,
        sectionTitle: 'Policy & Spatial Load Shifting',
        text: 'We demonstrate that dynamic spatial workload shifting — routing inference requests to regions with abundant wind or solar energy and low thermal cooling demands — can reduce carbon emissions by 38% and evaporative water withdrawal by 47% without increasing median round-trip latency beyond 120 milliseconds.',
      },
    ],
  },
  {
    id: 'doc-lora-hu',
    title: 'LoRA: Low-Rank Adaptation of Large Models',
    author: 'E. J. Hu, Y. Shen, P. Wallis, et al.',
    source: 'ICLR 2022 / Microsoft Cognitive Services Research',
    pageCount: 14,
    summary:
      'Introduces Low-Rank Adaptation (LoRA), which freezes the pretrained model weights and injects trainable rank decomposition matrices into each layer of the Transformer.',
    coverColor: '#705847', // Sepia Brown
    coverPattern: 'diagonal',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
    totalQuestions: 2,
    groundingScoreAvg: 94,
    unsupportedClaimsCount: 0,
    isSaved: false,
    chunks: [
      {
        id: 'doc-lora-c1',
        chunkIndex: 1,
        page: 1,
        sectionTitle: 'Motivation & Weight Freeze Principle',
        text: 'An important paradigm of natural language processing consists of large-scale pre-training on general domain data and adaptation to specific tasks. Full fine-tuning becomes prohibitive as models scale into hundreds of billions of parameters. LoRA freezes the pre-trained model weights and injects trainable rank decomposition matrices into each layer of the Transformer architecture, greatly reducing the number of trainable parameters for downstream tasks.',
      },
      {
        id: 'doc-lora-c2',
        chunkIndex: 2,
        page: 4,
        sectionTitle: 'Mathematical Formulation of Delta W',
        text: 'For a pre-trained weight matrix W_0 in R^{d x k}, we constrain its update by representing the latter with a low-rank decomposition: W_0 + Delta W = W_0 + B A, where B in R^{d x r}, A in R^{r x k}, and the rank r is much smaller than min(d, k). During training, W_0 is frozen and does not receive gradient updates, while A and B contain trainable parameters. Note both W_0 and Delta W = B A are multiplied with the same input x.',
      },
      {
        id: 'doc-lora-c3',
        chunkIndex: 3,
        page: 9,
        sectionTitle: 'Storage & Inference Latency',
        text: 'LoRA reduces the number of trainable parameters by 10,000 times and the GPU memory requirement by 3 times compared to full fine-tuning. Crucially, when deployed in production, we can explicitly compute and store W = W_0 + B A and perform inference as usual. Therefore, LoRA introduces no additional inference latency compared to a fully fine-tuned model.',
      },
    ],
  },
];

export const INITIAL_QAS: Record<string, QAInteraction[]> = {
  'doc-vaswani-2017': [
    {
      id: 'qa-vaswani-1',
      documentId: 'doc-vaswani-2017',
      question: 'How does the Transformer eliminate recurrence, and why does that improve training?',
      timestamp: Date.now() - 1000 * 60 * 60 * 18,
      answer:
        'The Transformer relies entirely on a self-attention mechanism to draw global dependencies between input and output representations rather than sequential recurrent connections. Because it does not process tokens step-by-step, the model allows for significantly greater parallelization during training. As a result, the authors reached state-of-the-art translation quality after training for only twelve hours on eight P100 GPUs.',
      groundingScore: 100,
      hasUnsupportedClaims: false,
      claims: [
        {
          id: 'claim-v1-1',
          claimText:
            'The Transformer relies entirely on an attention mechanism to draw global dependencies instead of sequential recurrent layers.',
          status: 'SUPPORTED',
          confidence: 98,
          supportingChunkIds: ['doc-vaswani-c1'],
          exactQuote:
            'The Transformer relies entirely on an attention mechanism to draw global dependencies between input and output.',
          explanation: 'Directly supported by Section 1: Abstract & Introduction.',
        },
        {
          id: 'claim-v1-2',
          claimText:
            'The architecture allows for significantly more parallelization during computation.',
          status: 'SUPPORTED',
          confidence: 99,
          supportingChunkIds: ['doc-vaswani-c1'],
          exactQuote:
            'The Transformer allows for significantly more parallelization and can reach a new state of the art',
          explanation: 'Verbatim evidence present in Chunk 1.',
        },
        {
          id: 'claim-v1-3',
          claimText:
            'The model achieved state-of-the-art results with as little as twelve hours of training on eight P100 GPUs.',
          status: 'SUPPORTED',
          confidence: 97,
          supportingChunkIds: ['doc-vaswani-c1'],
          exactQuote:
            'trained for as little as twelve hours on eight P100 GPUs.',
          explanation: 'Specific training hardware and timeframe verified in Chunk 1.',
        },
      ],
      retrievedPassages: [
        {
          chunkId: 'doc-vaswani-c1',
          chunkIndex: 1,
          page: 1,
          sectionTitle: 'Abstract & Introduction',
          text: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The Transformer relies entirely on an attention mechanism to draw global dependencies between input and output. The Transformer allows for significantly more parallelization and can reach a new state of the art in translation quality after being trained for as little as twelve hours on eight P100 GPUs.',
          similarityScore: 94,
          highlightSnippet: 'The Transformer relies entirely on an attention mechanism to draw global dependencies between input and output.',
        },
        {
          chunkId: 'doc-vaswani-c3',
          chunkIndex: 3,
          page: 5,
          sectionTitle: 'Positional Encoding & Residuals',
          text: 'Since our model contains no recurrence and no convolution, in order for the model to make use of the order of the sequence, we must inject some information about the relative or absolute position of the tokens in the sequence.',
          similarityScore: 78,
        },
      ],
    },
  ],
  'doc-bubeck-2023': [
    {
      id: 'qa-bubeck-1',
      documentId: 'doc-bubeck-2023',
      question: 'What architectural limitations did the authors discover regarding planning and memory in GPT-4?',
      timestamp: Date.now() - 1000 * 60 * 60 * 12,
      answer:
        'The authors observed that GPT-4 possesses fundamental limits due to its autoregressive next-token prediction scheme. It lacks an internal working memory to backtrack, look ahead, or verify long-horizon plans. When an error is committed during multi-step reasoning, the model continues forward confidently and compounds hallucinations. Additionally, the paper claims GPT-4 features an active internal consciousness module that monitors its errors.',
      groundingScore: 75,
      hasUnsupportedClaims: true,
      claims: [
        {
          id: 'claim-b1-1',
          claimText:
            'GPT-4 has architectural limitations stemming from its autoregressive next-token architecture.',
          status: 'SUPPORTED',
          confidence: 96,
          supportingChunkIds: ['doc-bubeck-c3'],
          exactQuote:
            'GPT-4’s autoregressive next-token architecture has intrinsic limitations.',
          explanation: 'Confirmed by Section 3: Limitations.',
        },
        {
          id: 'claim-b1-2',
          claimText:
            'The system lacks an internal working memory to backtrack, look ahead, or verify multi-step plans.',
          status: 'SUPPORTED',
          confidence: 98,
          supportingChunkIds: ['doc-bubeck-c3'],
          exactQuote:
            'It lacks an internal working memory to backtrack, look ahead, or verify long-horizon plans.',
          explanation: 'Accurately stated in Section 3 text.',
        },
        {
          id: 'claim-b1-3',
          claimText:
            'The paper claims GPT-4 features an active internal consciousness module that monitors its errors.',
          status: 'UNSUPPORTED',
          confidence: 12,
          supportingChunkIds: [],
          exactQuote: '',
          explanation:
            '⚠️ Unsupported: The text makes no claim of an "internal consciousness module". In fact, it notes the model lacks live working representations and fails to backtrack.',
        },
      ],
      retrievedPassages: [
        {
          chunkId: 'doc-bubeck-c3',
          chunkIndex: 3,
          page: 44,
          sectionTitle: 'Limitations: Planning & Working Memory',
          text: 'GPT-4’s autoregressive next-token architecture has intrinsic limitations. It lacks an internal working memory to backtrack, look ahead, or verify long-horizon plans. When an erroneous token is generated in a multi-step proof or navigation problem, the model continues forward confidently, often compounding errors (hallucinations). It does not maintain a continuous live representation of world state.',
          similarityScore: 92,
          highlightSnippet: 'It lacks an internal working memory to backtrack, look ahead, or verify long-horizon plans.',
        },
      ],
    },
  ],
};
