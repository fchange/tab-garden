#!/usr/bin/env node
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import OpenCC from 'opencc-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const defaultSourceRoot = '/tmp/tab-garden-poetry-npm/package/dist';
const sourceRoot = process.argv[2] ? path.resolve(process.argv[2]) : defaultSourceRoot;
const outputPath = path.join(projectRoot, 'public/data/poems.v1.min.json');
const targetCount = Number(process.env.POEM_COUNT || 5000);
const toSimplified = OpenCC.Converter({ from: 't', to: 'cn' });

const FAMOUS_AUTHORS = new Map(
  [
    ['李白', 900],
    ['杜甫', 900],
    ['王维', 760],
    ['白居易', 720],
    ['孟浩然', 700],
    ['李商隐', 680],
    ['杜牧', 680],
    ['韦应物', 620],
    ['刘禹锡', 620],
    ['岑参', 600],
    ['高适', 580],
    ['王昌龄', 580],
    ['贾岛', 520],
    ['柳宗元', 520],
    ['韩愈', 500],
    ['元稹', 480],
    ['张九龄', 460],
    ['王之涣', 460],
    ['贺知章', 440],
    ['常建', 420],
    ['陶渊明', 420],
    ['苏轼', 760],
    ['陆游', 720],
    ['王安石', 660],
    ['黄庭坚', 620],
    ['杨万里', 600],
    ['范成大', 560],
    ['梅尧臣', 500],
    ['欧阳修', 500],
    ['文天祥', 460],
  ].map(([name, score]) => [name, Number(score)]),
);

const TITLE_BLOCKLIST =
  /^(句|诗|颂|偈|偈颂)$|失题|缺题|佚句|残句|句$|偈|颂古|挽|哭|祭|悼|哀|墓|孝|神宗|太宗|皇帝|上元|奉和|应制|送僧|赠僧|寺|禅|佛|经/;
const TEXT_BLOCKLIST = /[\[\]（）()《》「」『』{}□�a-zA-Z0-9]/;
const AUTHOR_BLOCKLIST = /^(释|僧)|道者|和尚|禅师|法师|大师|比丘|尼$/;
const RELIGIOUS_TEXT_BLOCKLIST = /释子|衣钵|般若|禅|和尚|僧|佛|菩提|袈裟|梵|法界|祖师|出家/;
const CANONICAL_OVERRIDES = new Map([
  [
    '李白\u0000静夜思',
    {
      paragraphs: ['床前明月光，疑是地上霜。', '举头望明月，低头思故乡。'],
    },
  ],
]);

function simplifyText(text) {
  let result = String(text || '');
  for (let count = 0; count < 3; count += 1) {
    const next = toSimplified(result);
    if (next === result) break;
    result = next;
  }
  return result;
}

function simplifyPoem(poem) {
  const simplified = {
    ...poem,
    title: simplifyText(poem.title),
    author: simplifyText(poem.author),
    paragraphs: (poem.paragraphs || []).map(simplifyText),
  };
  const override = CANONICAL_OVERRIDES.get(`${simplified.author}\u0000${simplified.title}`);

  return override ? { ...simplified, ...override } : simplified;
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function stableHash(input) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function cjkLength(input) {
  return [...input].filter((char) => /[\u3400-\u9fff]/u.test(char)).length;
}

function splitClauses(paragraph) {
  return String(paragraph)
    .split(/[，。！？；、]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function getMeter(paragraphs) {
  if (paragraphs.length !== 2 && paragraphs.length !== 4) return null;

  const clauses = paragraphs.flatMap(splitClauses);
  if (clauses.length !== paragraphs.length * 2) return null;

  const lengths = clauses.map(cjkLength);
  const uniqueLengths = [...new Set(lengths)];
  if (uniqueLengths.length !== 1 || ![5, 7].includes(uniqueLengths[0])) return null;

  if (paragraphs.some((paragraph) => cjkLength(paragraph) > 16)) return null;

  const lineLength = uniqueLengths[0];
  return {
    lineLength,
    form: paragraphs.length === 2 ? '绝句' : '律诗',
    category: `${lineLength === 5 ? '五' : '七'}言${paragraphs.length === 2 ? '绝句' : '律诗'}`,
  };
}

function isUsablePoem(poem) {
  const paragraphs = (poem.paragraphs || []).map((line) => String(line).trim()).filter(Boolean);
  if (!poem.title || !poem.author || paragraphs.length === 0) return false;
  if (TITLE_BLOCKLIST.test(poem.title)) return false;
  if (AUTHOR_BLOCKLIST.test(poem.author)) return false;
  if (TEXT_BLOCKLIST.test(`${poem.title}${poem.author}${paragraphs.join('')}`)) return false;
  if (RELIGIOUS_TEXT_BLOCKLIST.test(`${poem.title}${paragraphs.join('')}`)) return false;
  if (!getMeter(paragraphs)) return false;
  return true;
}

function scorePoem(poem, dynasty, meter, rankScore, sourceTags) {
  let score = rankScore;
  score += FAMOUS_AUTHORS.get(poem.author) || 0;
  score += dynasty === '唐' ? 420 : 220;
  score += meter.form === '绝句' ? 260 : 120;
  score += meter.lineLength === 5 ? 90 : 70;

  if (sourceTags.includes('唐诗三百首')) score += 1200;
  if (/春|月|山|水|江|夜|雪|雨|风|花|秋|云|竹|梅|松|溪|湖|酒|梦|归|客|别|思|怀|望/.test(poem.title)) {
    score += 90;
  }
  if (/帝京|宫词|郊庙|封禅|神仙|寺|僧|禅|题咏/.test(poem.title)) {
    score -= 260;
  }
  if (/太宗皇帝|宋太祖|释|僧|尼$/.test(poem.author)) {
    score -= 360;
  }

  score += stableHash(`${poem.author}:${poem.title}`) / 0xffffffff;
  return score;
}

function collectRankScores(quantangshiRoot) {
  const rankRoot = path.join(path.dirname(quantangshiRoot), 'rank/poet');
  const scores = new Map();

  for (const fileName of readdirSync(rankRoot)) {
    if (!/^poet\.(tang|song)\.rank\.\d+\.json$/.test(fileName)) continue;
    const items = readJson(path.join(rankRoot, fileName));
    for (const item of items) {
      const key = `${simplifyText(item.author)}\u0000${simplifyText(item.title)}`;
      const score = Math.log10(
        1 +
          Number(item.baidu || 0) +
          Number(item.so360 || 0) +
          Number(item.bing || 0) +
          Number(item.bing_en || 0) +
          Number(item.google || 0),
      );
      scores.set(key, Math.max(scores.get(key) || 0, score * 120));
    }
  }

  return scores;
}

function collectSpecialTags(quantangshiRoot) {
  const specialFiles = ['唐诗三百首.json'];
  const tags = new Map();

  for (const fileName of specialFiles) {
    const filePath = path.join(quantangshiRoot, fileName);
    const items = readJson(filePath);
    for (const item of items) {
      const key = `${simplifyText(item.author)}\u0000${simplifyText(item.title)}`;
      tags.set(key, [...(tags.get(key) || []), ...((item.tags || []).filter(Boolean))]);
    }
  }

  return tags;
}

function collectCandidates() {
  const quantangshiRoot = path.join(sourceRoot, 'quantangshi');
  const rankScores = collectRankScores(quantangshiRoot);
  const specialTags = collectSpecialTags(quantangshiRoot);
  const candidates = [];
  const seen = new Set();

  for (const fileName of readdirSync(quantangshiRoot)) {
    if (!/^poet\.(tang|song)\.\d+\.json$/.test(fileName)) continue;
    const dynasty = fileName.includes('.tang.') ? '唐' : '宋';
    const items = readJson(path.join(quantangshiRoot, fileName));

    for (const rawPoem of items) {
      const poem = simplifyPoem(rawPoem);
      if (!isUsablePoem(poem)) continue;

      const paragraphs = poem.paragraphs.map((line) => String(line).trim()).filter(Boolean);
      const meter = getMeter(paragraphs);
      if (!meter) continue;

      const signature = `${poem.author}\u0000${poem.title}\u0000${paragraphs.join('')}`;
      if (seen.has(signature)) continue;
      seen.add(signature);

      const key = `${poem.author}\u0000${poem.title}`;
      const sourceTags = specialTags.get(key) || [];
      const score = scorePoem(poem, dynasty, meter, rankScores.get(key) || 0, sourceTags);

      candidates.push({
        id: poem.id || stableHash(signature).toString(36),
        t: poem.title,
        a: poem.author,
        d: dynasty,
        k: meter.category,
        l: meter.lineLength,
        c: paragraphs,
        contentKey: `${poem.author}\u0000${paragraphs.join('')}`,
        score,
      });
    }
  }

  return candidates;
}

function choosePoems(candidates) {
  candidates.sort((left, right) => right.score - left.score);

  const selected = [];
  const contentKeys = new Set();
  const authorCounts = new Map();
  const categoryCounts = new Map();
  const caps = {
    唐: Math.round(targetCount * 0.72),
    宋: targetCount,
  };
  const dynastyCounts = new Map();

  for (const poem of candidates) {
    if (selected.length >= targetCount) break;

    const authorCount = authorCounts.get(poem.a) || 0;
    const categoryCount = categoryCounts.get(poem.k) || 0;
    const dynastyCount = dynastyCounts.get(poem.d) || 0;

    if (contentKeys.has(poem.contentKey)) continue;
    if (authorCount >= 95) continue;
    if (poem.d === '宋' && dynastyCount >= targetCount - caps.唐) continue;
    if (poem.d === '唐' && dynastyCount >= caps.唐) continue;
    if (poem.k.includes('律诗') && categoryCount >= Math.round(targetCount * 0.45)) continue;

    selected.push(poem);
    contentKeys.add(poem.contentKey);
    authorCounts.set(poem.a, authorCount + 1);
    categoryCounts.set(poem.k, categoryCount + 1);
    dynastyCounts.set(poem.d, dynastyCount + 1);
  }

  for (const poem of candidates) {
    if (selected.length >= targetCount) break;
    if (selected.some((item) => item.id === poem.id)) continue;
    if (contentKeys.has(poem.contentKey)) continue;
    selected.push(poem);
    contentKeys.add(poem.contentKey);
  }

  return selected
    .sort((left, right) => right.score - left.score)
    .map(({ score: _score, contentKey: _contentKey, ...poem }) => poem);
}

const candidates = collectCandidates();
const poems = choosePoems(candidates);

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(poems)}\n`);

const stats = poems.reduce(
  (result, poem) => {
    result.dynasty[poem.d] = (result.dynasty[poem.d] || 0) + 1;
    result.category[poem.k] = (result.category[poem.k] || 0) + 1;
    return result;
  },
  { dynasty: {}, category: {} },
);

console.log(`Wrote ${poems.length} poems to ${path.relative(projectRoot, outputPath)}`);
console.log(JSON.stringify(stats, null, 2));
