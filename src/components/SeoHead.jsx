import { useEffect } from 'react';

const upsertMetaTag = (name, content) => {
  if (!content) return;
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const upsertPropertyTag = (property, content) => {
  if (!content) return;
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const SeoHead = ({ title, description, image, jsonLd }) => {
  useEffect(() => {
    if (title) document.title = title;
    upsertMetaTag('description', description);
    upsertPropertyTag('og:title', title);
    upsertPropertyTag('og:description', description);
    upsertPropertyTag('og:image', image);

    let script = document.getElementById('jsonld-root');
    if (jsonLd) {
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'jsonld-root';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    } else if (script) {
      script.remove();
    }
  }, [title, description, image, jsonLd]);

  return null;
};

export default SeoHead;
