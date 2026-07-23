const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);

const card = document.querySelector("[data-typewriter-card]");
const scene = document.querySelector("[data-scroll-scene]");
const curtains = document.querySelector(".scroll-curtains");
const aboutScene = document.querySelector("[data-about-scene]");
const aboutCard = document.querySelector(".about-card");

function wrapTextNode(node, bucket) {
  const fragment = document.createDocumentFragment();

  for (const char of node.textContent) {
    const span = document.createElement("span");
    span.className = "type-char";
    span.textContent = char;
    fragment.appendChild(span);
    if (char.trim()) {
      bucket.push(span);
    }
  }

  node.replaceWith(fragment);
}

function prepareTypewriter(root) {
  const chars = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return node.textContent.trim()
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    },
  });

  const nodes = [];
  while (walker.nextNode()) {
    nodes.push(walker.currentNode);
  }

  nodes.forEach((node) => wrapTextNode(node, chars));
  return chars;
}

const chars = card ? prepareTypewriter(card) : [];

function updateScene() {
  if (!scene || !card || !curtains || !chars.length) return;

  const rect = scene.getBoundingClientRect();
  const scrollable = Math.max(1, rect.height - window.innerHeight);
  const progress = clamp(-rect.top / scrollable);
  const writingProgress = clamp(progress / 0.85);
  const curtainProgress = clamp((progress - 0.85) / 0.15);
  const visibleCount = Math.round(chars.length * writingProgress);

  chars.forEach((char, index) => {
    char.classList.toggle("is-visible", index < visibleCount);
  });

  curtains.style.setProperty("--curtain-close", curtainProgress.toFixed(3));
  card.style.setProperty("--card-ready", writingProgress.toFixed(3));
  card.style.setProperty("--card-lift", curtainProgress.toFixed(3));
}

function updateAboutScene() {
  if (!aboutScene || !aboutCard) return;

  const rect = aboutScene.getBoundingClientRect();
  const scrollable = Math.max(1, rect.height - window.innerHeight);
  const progress = clamp(-rect.top / scrollable);
  const eased = progress < 0.5
    ? 2 * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 2) / 2;
  const isMobile = window.matchMedia("(max-width: 700px)").matches;

  if (isMobile) {
    const aboutImage = aboutCard.querySelector("figure");
    const aboutCopy = aboutCard.querySelector(".about-copy");
    const mobileImageLift = Math.min(250, Math.max(170, window.innerHeight * 0.3));
    const imageHeight = aboutImage?.offsetHeight || 400;
    const copyHeight = aboutCopy?.offsetHeight || 500;
    const mobileCopyShift = Math.max(180, (imageHeight + copyHeight) / 2 - mobileImageLift);
    aboutCard.style.setProperty("--about-image-shift", "0px");
    aboutCard.style.setProperty("--about-image-lift", `${Math.round(eased * mobileImageLift)}px`);
    aboutCard.style.setProperty("--about-copy-shift", `${Math.round(eased * mobileCopyShift)}px`);
  } else {
    const imageShift = Math.min(330, window.innerWidth * 0.24) * eased;
    const copyShift = Math.min(330, window.innerWidth * 0.24) * eased;
    aboutCard.style.setProperty("--about-image-shift", `${Math.round(imageShift)}px`);
    aboutCard.style.setProperty("--about-copy-shift", `${Math.round(copyShift)}px`);
    aboutCard.style.setProperty("--about-image-lift", "0px");
  }

  aboutCard.style.setProperty("--about-progress", eased.toFixed(3));
}

function prepareScrollCards() {
  const items = document.querySelectorAll(
    ".solution-copy, .photo, .solution-note, .stacked-cards article, .showcase-card, .testimonials-copy, .testimonial-note, .exclusive-title, .exclusive-card, .exclusive-cta"
  );

  items.forEach((item) => item.classList.add("scroll-card"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
  );

  items.forEach((item) => observer.observe(item));
}

window.addEventListener("scroll", () => {
  updateScene();
  updateAboutScene();
}, { passive: true });
window.addEventListener("resize", () => {
  updateScene();
  updateAboutScene();
});
prepareScrollCards();
updateScene();
updateAboutScene();
