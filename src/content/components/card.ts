type CardOptions = {
  className?: string;
};

export function createCard({
  className = "",
}: CardOptions = {}): HTMLDivElement {
  const card =
    document.createElement("div");

  card.className = `
    relative
    flex
    flex-col
    overflow-hidden
    rounded-xl
    border
    border-solid
    border-gray-300
    bg-white
    ${className}
  `;

  return card;
}


export function createCardHeader({
  className = "",
}: CardOptions = {}): HTMLDivElement {
  const header =
    document.createElement("div");

  header.className = `
    flex
    p-3
    ${className}
  `;

  return header;
}


export function createCardBody({
  className = "",
}: CardOptions = {}): HTMLDivElement {
  const body =
    document.createElement("div");

  body.className = `
    relative
    flex-auto
    p-3
    ${className}
  `;

  return body;
}


export function createCardFooter({
  className = "",
}: CardOptions = {}): HTMLDivElement {
  const footer =
    document.createElement("div");

  footer.className = `
    flex
    p-3
    ${className}
  `;

  return footer;
}