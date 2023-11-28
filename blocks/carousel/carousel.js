import { fetchGraphQL } from '../../scripts/scripts.js';

export default function decorate(block) {
  if (block.classList.contains('products')) {
    const skus = block.firstElementChild.firstElementChild.innerText
      .split(',')
      .map((sku) => sku.trim())
      .filter((sku) => !!sku)
      .map((sku) => `"${sku}"`)
      .join(',');
    const query = `
    {
      products(filter: { sku: { in: [${skus}] } }) {
        items {
          name
          sku
          url_key
          stock_status
          swatch_image
          sub_title
          small_image{
              url
              label
          }
          price_range {
            minimum_price {
              final_price {
                value
                currency
              }
            }
          }
        }
        total_count
        page_info {
          page_size
        }
      }
    }  
    `;

    fetchGraphQL(query, {}).then(async (resp) => {
      if (resp.ok) {
        const respJson = await resp.json();
        const productItems = respJson.data.products.items;

        if (productItems) {
          const baseUrl = 'https://staging.lovesac.com/';
          const carouselEl = document.createElement('ol');

          carouselEl.classList.add('product-items', 'configurable-carousel', 'products-grid', 'glide__slides');
          block.innerHTML = '';
          block.append(carouselEl);

          productItems.forEach((product) => {
            // Use insertAdjacentHTML to add the template to the carousel element
            carouselEl.insertAdjacentHTML('beforeend', `
              <li class="product-item">
                <div class="product-item-info">
                  <a href="" class="product-item-photo">
                    <img src="${product.small_image.url}optimize=medium&bg-color=255,255,255&fit=bounds&height=300&width=300&canvas=300:300&format=jpeg" /> 
                  </a>
                  <div class="product-item-details">
                    <strong class="product-item-name">
                      <a title=""
                        href="${baseUrl + product.urlkey}.html"
                        class="product-item-link">
                          ${product.name}
                      </a>
                    </strong>
                    <div class="price-box">
                      <p>$${new Intl.NumberFormat().format(product.price_range.minimum_price.final_price.value)}</p>
                    </div>
                    <div class="product-sub-title">
                      ${product.sub_title}
                    </div>
                  </div>
                </div>
              </li>
            `);
          });

          const buttonLeft = document.createElement('div');
          buttonLeft.classList.add('carousel-arrow', 'carousel-arrow-left');
          block.parentElement.append(buttonLeft);

          const buttonRight = document.createElement('div');
          buttonRight.classList.add('carousel-arrow', 'carousel-arrow-right');
          block.parentElement.append(buttonRight);

          buttonRight.addEventListener('click', () => {
            const productItem = block.querySelector('.product-item');
            const itemWidth = productItem.offsetWidth - block.querySelector('.configurable-carousel').offsetLeft;
            block.scrollTo({ left: itemWidth + block.scrollLeft, behavior: 'smooth' });
          });

          buttonLeft.addEventListener('click', () => {
            const productItem = block.querySelector('.product-item');
            const itemWidth = productItem.offsetWidth - block.querySelector('.configurable-carousel').offsetLeft;
            if (block.scrollLeft !== 0) {
              if (block.scrollLeft <= itemWidth) {
                block.scrollTo({ left: 0, behavior: 'smooth' });
              } else {
                block.scrollTo({ left: block.scrollLeft - itemWidth, behavior: 'smooth' });
              }
            }
          });
        }
      }
    });

    return;
  }

  const buttons = document.createElement('div');
  buttons.className = 'carousel-buttons';
  [...block.children].forEach((row, i) => {
    const classes = ['image', 'text'];
    classes.forEach((e, j) => {
      row.children[j].classList.add(`carousel-${e}`);
    });
    /* buttons */
    const button = document.createElement('button');
    if (!i) button.classList.add('selected');
    button.addEventListener('click', () => {
      block.scrollTo({ top: 0, left: row.offsetLeft - row.parentNode.offsetLeft, behavior: 'smooth' });
      [...buttons.children].forEach((r) => r.classList.remove('selected'));
      button.classList.add('selected');
    });
    buttons.append(button);
  });
  block.parentElement.append(buttons);
}
