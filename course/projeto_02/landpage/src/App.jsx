import './App.css'

/* ─── Data ─────────────────────────────────────────────────────── */

const historyCards = [
  {
    icon: '🌊',
    title: 'O Berço da Civilização',
    text: 'A Mesopotâmia ("terra entre rios") surgiu entre o Tigre e o Eufrates por volta de 4000 a.C. Foi ali que nasceram a escrita cuneiforme, as primeiras cidades e os primeiros códigos de lei da humanidade.',
  },
  {
    icon: '🏛️',
    title: 'Babilônia — A Cidade Eterna',
    text: 'Capital do Império Babilônico, Babilônia atingiu seu apogeu sob Nabucodonosor II (605–562 a.C.). Com suas muralhas duplas, portão de Ishtar e os lendários Jardins Suspensos, era considerada a maior cidade do mundo antigo.',
  },
  {
    icon: '⚖️',
    title: 'Código de Hamurabi',
    text: 'Promulgado por volta de 1754 a.C., o Código de Hamurabi é um dos mais antigos conjuntos de leis escritas da história. Seus 282 artigos regulavam comércio, família, trabalho e crimes — influenciando sistemas jurídicos por milênios.',
  },
  {
    icon: '🌟',
    title: 'Astronomia e Matemática',
    text: 'Os babilônios desenvolveram um sistema numérico de base 60 (ainda usado em horas, minutos e graus), criaram os primeiros mapas do céu e calcularam eclipses com precisão surpreendente para a época.',
  },
  {
    icon: '🛡️',
    title: 'Poder Militar',
    text: 'O exército babilônico era formado por arqueiros montados, infantaria pesada e carros de guerra. Nabucodonosor II conquistou Jerusalém duas vezes e destruiu o Templo de Salomão em 587 a.C.',
  },
  {
    icon: '🌿',
    title: 'Religião e Mitologia',
    text: 'O panteão babilônico incluía Marduk (deus supremo), Ishtar (guerra e amor) e Ea (sabedoria). O épico de Gilgamesh, escrito em tabletas cuneiformes, é uma das mais antigas narrativas literárias da humanidade.',
  },
]

const units = [
  {
    icon: '🏹',
    name: 'Arqueiro Composto',
    type: 'Unidade de Ataque à Distância',
    desc: 'O arqueiro composto babilônico é a espinha dorsal do exército. Com alcance e cadência de disparo superiores, domina o campo de batalha aberto e é devastador contra infantaria levemente protegida.',
    stats: [
      { label: 'Alcance', value: '+1 bônus' },
      { label: 'Tipo', value: 'Arqueiro' },
      { label: 'Eficaz vs', value: 'Infantaria' },
    ],
  },
  {
    icon: '⛪',
    name: 'Sacerdote',
    type: 'Unidade de Suporte / Conversão',
    desc: 'Os sacerdotes babilônicos são dos mais poderosos do jogo. Com regeneração de fé 30% mais rápida, convertem unidades inimigas com maior frequência e recuperam sua capacidade de agir em menos tempo.',
    stats: [
      { label: 'Bônus', value: 'Fé +30%' },
      { label: 'Tipo', value: 'Suporte' },
      { label: 'Eficaz vs', value: 'Unidades inimigas' },
    ],
  },
  {
    icon: '🗡️',
    name: 'Guerreiro de Infantaria',
    type: 'Unidade de Combate Corpo-a-Corpo',
    desc: 'A infantaria pesada babilônica porta lanças e escudos de madeira revestidos de bronze. Sólida para defesa de formações e cercos, mas com mobilidade limitada comparada às civilizações nômades.',
    stats: [
      { label: 'Armor', value: 'Pesada' },
      { label: 'Tipo', value: 'Infantaria' },
      { label: 'Eficaz vs', value: 'Arqueiros' },
    ],
  },
  {
    icon: '🪖',
    name: 'Carro de Guerra',
    type: 'Unidade de Cavalaria Pesada',
    desc: 'Os carros de guerra babilônicos eram símbolo de poder real. No jogo, representam a mobilidade ofensiva da civilização — rápidos o suficiente para flanquear formações inimigas e romper linhas defensivas.',
    stats: [
      { label: 'Velocidade', value: 'Alta' },
      { label: 'Tipo', value: 'Cavalaria' },
      { label: 'Eficaz vs', value: 'Arqueiros' },
    ],
  },
]

const buildings = [
  {
    icon: '🌺',
    name: 'Jardins Suspensos da Babilônia',
    label: 'Maravilha do Mundo — Wonder',
    desc: 'A Maravilha da civilização Babilônica em Age of Empires I. Construí-la garante a vitória por pontos. Historicamente atribuída a Nabucodonosor II para a rainha Amytis, é uma das Sete Maravilhas do Mundo Antigo.',
    featured: true,
  },
  {
    icon: '🗼',
    name: 'Zigurate',
    label: 'Templo / Produção de Sacerdotes',
    desc: 'Estrutura religiosa em degraus que dominava o horizonte das cidades mesopotâmicas. No jogo, o templo babilônico é o local de treinamento dos poderosos sacerdotes e pesquisa de melhorias religiosas.',
    featured: false,
  },
  {
    icon: '🧱',
    name: 'Muralha de Babilônia',
    label: 'Estrutura Defensiva — Tower / Wall',
    desc: 'As torres babilônicas têm 3× o HP padrão, tornando a defesa perimetral praticamente impenetrável. Na história, as duplas muralhas de Babilônia tinham largura suficiente para duas quadrigas passarem lado a lado.',
    featured: false,
  },
  {
    icon: '🚪',
    name: 'Portão de Ishtar',
    label: 'Monumento Histórico',
    desc: 'Construído por Nabucodonosor II, o Portão de Ishtar era a entrada norte de Babilônia, revestido de azulejos esmaltados azuis com relevos de dragões e touros. Representa o poderio arquitetônico da civilização.',
    featured: false,
  },
]

const technologies = [
  {
    icon: '🏗️',
    name: 'Alvenaria Avançada',
    era: 'Era de Bronze',
    desc: 'Desbloqueia estruturas de pedra de maior HP. Essencial para maximizar a resistência já elevada das torres babilônicas, que chegam a absorver quantidades absurdas de dano antes de cair.',
  },
  {
    icon: '🔱',
    name: 'Sacerdócio',
    era: 'Era do Ferro',
    desc: 'Aumenta o alcance de conversão dos sacerdotes. Combinado com o bônus natural de regeneração de fé dos babilônios, cria uma máquina de conversão que pode virar batalhões inimigos em aliados.',
  },
  {
    icon: '🏹',
    name: 'Arqueirismo Composto',
    era: 'Era de Bronze',
    desc: 'Melhora o dano e o alcance dos arqueiros. Os babilônios tinham acesso ao arco composto historicamente e, no jogo, essa tecnologia potencializa a principal força ofensiva da civilização.',
  },
  {
    icon: '⚙️',
    name: 'Engenharia de Cerco',
    era: 'Era do Ferro',
    desc: 'Desbloqueia catapultas e aríetes aprimorados. Permite que os babilônios, fortes na defesa, também conduzam cercos efetivos a cidades inimigas sem perder tempo ou tropas desnecessariamente.',
  },
  {
    icon: '🌾',
    name: 'Irrigação',
    era: 'Era da Ferramenta',
    desc: 'Aumenta a produção de fazendas. Historicamente os babilônios foram pioneiros em sistemas de irrigação ao longo do Tigre e Eufrates, e no jogo essa tecnologia garante uma base econômica estável.',
  },
  {
    icon: '⚖️',
    name: 'Código de Leis',
    era: 'Era de Bronze',
    desc: 'Tecnologia temática que aumenta a produção de aldeões e reduz o tempo de treinamento. Representa a organização social avançada da Babilônia, que sustentava cidades de dezenas de milhares de habitantes.',
  },
]

const strategies = [
  {
    title: 'Turtle Defensivo',
    tips: [
      'Construa torres no perímetro do seu território o mais cedo possível.',
      'Com 3× de HP, suas torres aguantam ataques de rush sem reforços.',
      'Use o tempo extra para acumular recursos e avançar de era.',
      'Sacerdotes atrás das muralhas convertem inimigos que se aproximam.',
    ],
  },
  {
    title: 'Domínio Religioso',
    tips: [
      'Produza sacerdotes em massa na Era de Bronze avançada.',
      'O bônus de regeneração permite reconverter continuamente.',
      'Prioritize pesquisar Sacerdócio para aumentar o alcance.',
      'Combine sacerdotes com arqueiros para protegê-los do contra-ataque.',
    ],
  },
  {
    title: 'Rush de Arqueiros',
    tips: [
      'Produza arqueiros compostos desde cedo e pressione o adversário.',
      'Babilônios têm acesso ao arco composto na Era de Bronze.',
      'Mantenha distância segura de unidades de melê inimigas.',
      'Use a vantagem de alcance para desgastar sem sofrer baixas.',
    ],
  },
  {
    title: 'Corrida pela Wonder',
    tips: [
      'Defenda com torres enquanto acumula recursos massivos.',
      'Planeje a Wonder para a Era do Ferro com excedente econômico.',
      'Mantenha patrulhas de cavalaria para detectar sabotagens.',
      'Lembre: vencer por Wonder requer 2000 anos de jogo (pontos).',
    ],
  },
]

/* ─── Components ────────────────────────────────────────────────── */

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <span className="navbar-brand">⚔ Age of Empires — Mesopotâmia</span>
        <div className="navbar-nav">
          <a href="#historia">História</a>
          <a href="#civilizacao">Civilização</a>
          <a href="#unidades">Unidades</a>
          <a href="#construcoes">Construções</a>
          <a href="#tecnologias">Tecnologias</a>
          <a href="#estrategia">Estratégia</a>
        </div>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg" />
      <div className="hero-content">
        <div className="hero-badge">Age of Empires I &amp; Return of Rome</div>
        <h1 className="hero-title">Mesopotâmia<br />&amp; Babilônia</h1>
        <p className="hero-subtitle">O berço da civilização no campo de batalha</p>
        <p className="hero-description">
          Explore a história e as mecânicas de jogo da civilização mais antiga e
          poderosa do universo de Age of Empires — dos Jardins Suspensos às torres
          indestrutíveis, dos sacerdotes aos arqueiros compostos.
        </p>
        <a href="#historia" className="hero-cta">Explorar a Civilização</a>
      </div>
      <div className="hero-scroll-hint">▾ &nbsp; Role para descobrir &nbsp; ▾</div>
    </section>
  )
}

function Divider({ symbol = '✦' }) {
  return (
    <div className="divider">
      <span className="divider-symbol">{symbol}</span>
    </div>
  )
}

function HistorySection() {
  return (
    <section id="historia" className="section">
      <h2 className="section-title">Contexto Histórico</h2>
      <p className="section-lead">
        Antes de dominar o jogo, entenda a civilização que dominou o mundo antigo
        por mais de três milênios.
      </p>
      <div className="history-grid">
        {historyCards.map((card) => (
          <div key={card.title} className="history-card">
            <div className="history-card-icon">{card.icon}</div>
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function CivSection() {
  return (
    <section id="civilizacao" className="section">
      <h2 className="section-title">A Civilização no Jogo</h2>
      <p className="section-lead">
        Os Babilônios em Age of Empires I são uma civilização de defesa e religião —
        lenta para avançar, mas quase inexpugnável quando entrincheirada.
      </p>
      <div className="civ-wrapper">
        <div className="civ-header">
          <div className="civ-emblem">🏺</div>
          <div className="civ-header-info">
            <h3>Babilônios</h3>
            <p>Age of Empires I (1997) &amp; AoE: Return of Rome (2023)</p>
          </div>
        </div>
        <div className="civ-body">
          <div className="civ-stat">
            <div className="civ-stat-label">Bônus Principal</div>
            <div className="civ-stat-value">
              <strong>Torres com 3× HP</strong> — as estruturas defensivas mais resistentes do jogo
            </div>
          </div>
          <div className="civ-stat">
            <div className="civ-stat-label">Bônus Secundário</div>
            <div className="civ-stat-value">
              <strong>Sacerdotes regeneram fé 30% mais rápido</strong> — conversões mais frequentes
            </div>
          </div>
          <div className="civ-stat">
            <div className="civ-stat-label">Maravilha</div>
            <div className="civ-stat-value">
              <strong>Jardins Suspensos da Babilônia</strong> — uma das Sete Maravilhas do Mundo Antigo
            </div>
          </div>
          <div className="civ-stat">
            <div className="civ-stat-label">Estilo de Jogo</div>
            <div className="civ-stat-value">
              <strong>Defesa e religião</strong> — forte na contenção e na conversão, menor mobilidade
            </div>
          </div>
          <div className="civ-stat">
            <div className="civ-stat-label">Ponto Forte</div>
            <div className="civ-stat-value">
              Defesa perimetral praticamente <strong>impenetrável</strong> com torres de altíssimo HP
            </div>
          </div>
          <div className="civ-stat">
            <div className="civ-stat-label">Ponto Fraco</div>
            <div className="civ-stat-value">
              Cavalaria <strong>mais cara</strong> e avanço de eras ligeiramente mais lento
            </div>
          </div>
        </div>
      </div>

      <div className="tag-list">
        <span className="tag tag-strength">✓ Torres 3× HP</span>
        <span className="tag tag-strength">✓ Sacerdotes poderosos</span>
        <span className="tag tag-strength">✓ Arqueiros compostos</span>
        <span className="tag tag-strength">✓ Wonder icônica</span>
        <span className="tag tag-weakness">✗ Cavalaria mais cara</span>
        <span className="tag tag-weakness">✗ Avanço de era mais lento</span>
        <span className="tag tag-weakness">✗ Menor mobilidade ofensiva</span>
      </div>
    </section>
  )
}

function UnitsSection() {
  return (
    <section id="unidades" className="section">
      <h2 className="section-title">Unidades Militares</h2>
      <p className="section-lead">
        O exército babilônico combina disciplina defensiva com poder de conversão
        único — cada unidade tem um papel estratégico bem definido.
      </p>
      <div className="units-grid">
        {units.map((u) => (
          <div key={u.name} className="unit-card">
            <div className="unit-header">
              <div className="unit-icon">{u.icon}</div>
              <div>
                <h3>{u.name}</h3>
                <div className="unit-type">{u.type}</div>
              </div>
            </div>
            <p className="unit-description">{u.desc}</p>
            <div className="unit-stats">
              {u.stats.map((s) => (
                <div key={s.label} className="unit-stat">
                  {s.label}: <span>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function BuildingsSection() {
  return (
    <section id="construcoes" className="section">
      <h2 className="section-title">Construções Icônicas</h2>
      <p className="section-lead">
        Da maravilha do mundo às muralhas impenetráveis — a arquitetura babilônica
        é um diferencial tanto na história quanto no jogo.
      </p>
      <div className="buildings-grid">
        {buildings.map((b) => (
          <div key={b.name} className={`building-card${b.featured ? ' featured' : ''}`}>
            <div className="building-icon">{b.icon}</div>
            <h3>{b.name}</h3>
            <div className="aoe-label">{b.label}</div>
            <p>{b.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function TechSection() {
  return (
    <section id="tecnologias" className="section">
      <h2 className="section-title">Tecnologias e Pesquisas</h2>
      <p className="section-lead">
        Cada tecnologia representa uma conquista histórica dos povos mesopotâmicos,
        traduzida em vantagem estratégica no jogo.
      </p>
      <div className="tech-list">
        {technologies.map((t) => (
          <div key={t.name} className="tech-item">
            <div className="tech-icon">{t.icon}</div>
            <div className="tech-content">
              <h4>{t.name}</h4>
              <p>{t.desc}</p>
            </div>
            <div className="tech-era">{t.era}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function StrategySection() {
  return (
    <section id="estrategia" className="section">
      <h2 className="section-title">Estratégias de Jogo</h2>
      <p className="section-lead">
        Quatro abordagens para dominar com os Babilônios — da defesa absoluta
        à vitória por Wonder.
      </p>
      <div className="strategy-grid">
        {strategies.map((s) => (
          <div key={s.title} className="strategy-card">
            <h3>{s.title}</h3>
            <ul>
              {s.tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Divider symbol="⚜" />

      <div className="quote-block">
        <p className="quote-text">
          "Se um homem roubou os bens de um templo ou do palácio, esse homem
          deverá ser morto, e também aquele que recebeu o bem roubado de suas mãos."
        </p>
        <div className="quote-author">Código de Hamurabi — ca. 1754 a.C.</div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-title">Mesopotâmia &amp; Babilônia — Age of Empires</div>
        <p className="footer-note">
          Conteúdo educativo desenvolvido para a disciplina de{' '}
          <strong>Sistemas Distribuídos</strong>. Informações históricas baseadas em
          fontes acadêmicas; dados de jogo referentes a{' '}
          <strong>Age of Empires I</strong> e{' '}
          <strong>Age of Empires: Return of Rome (2023)</strong>.
        </p>
      </div>
    </footer>
  )
}

/* ─── App ───────────────────────────────────────────────────────── */

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <Hero />
      <HistorySection />
      <Divider />
      <CivSection />
      <Divider />
      <UnitsSection />
      <Divider />
      <BuildingsSection />
      <Divider />
      <TechSection />
      <Divider />
      <StrategySection />
      <Footer />
    </div>
  )
}
