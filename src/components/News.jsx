import FifaNewsCard from './FifaNewsCard';
import news from '../data/news';

function News() {
  const featured = news.find(n => n.featured);
  const rest = news.filter(n => !n.featured);

  return (
    <div className="news-page">
      <div className="news-header">
        <h2>📰 Notícias da <span>Copa 2026</span></h2>
        <p className="news-subtitle">As últimas notícias, análises e informações direto do mundo da Copa do Mundo da FIFA 2026™</p>
      </div>

      <div className="news-grid">
        {featured && (
          <div className="news-grid-featured">
            <FifaNewsCard article={featured} featured />
          </div>
        )}
        {rest.slice(0, 2).map(article => (
          <div key={article.id} className="news-grid-item">
            <FifaNewsCard article={article} />
          </div>
        ))}
      </div>

      <div className="news-list">
        {rest.slice(2).map(article => (
          <FifaNewsCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}

export default News;
