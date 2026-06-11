function FifaNewsCard({ article, featured }) {
  return (
    <a href={article.url} target="_blank" rel="noopener noreferrer" className={`fifa-news-card ${featured ? 'fifa-news-card--featured' : ''}`}>
      <div className="fifa-news-card-image">
        <img
          src={article.image}
          alt={article.title}
          loading="lazy"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.classList.add('fifa-news-card-image--fallback');
          }}
        />
        <div className="fifa-news-card-gradient"></div>
      </div>
      <div className="fifa-news-card-body">
        <span className="fifa-news-card-overline">{article.category}</span>
        <h3 className="fifa-news-card-title">{article.title}</h3>
        <p className="fifa-news-card-description">{article.description}</p>
        <div className="fifa-news-card-footer">
          <span className="fifa-news-card-date">{article.date}</span>
          <span className="fifa-news-card-cta">
            Ler mais
            <svg className="fifa-news-card-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </span>
        </div>
      </div>
    </a>
  );
}

export default FifaNewsCard;
