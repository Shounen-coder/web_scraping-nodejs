const puppeteer = require('puppeteer');
const fs = require('fs')

const scrape = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const allbooks = []
    let currenPage = 1;
    const maxPages = 10;

    while(currenPage <= maxPages) {
        const url = `https://books.toscrape.com/catalogue/page-${currenPage}.html`; 

    await page.goto(url);
                                // const title = await page.title();
                                // console.log(`Page titer: ${title}`);

    // Wait for the books to load on the page
    await page.waitForSelector('.product_pod');

    const books = await page.evaluate(()=>{
        const bookelements = document.querySelectorAll('.product_pod')
        return Array.from(bookelements).map((book) => {
            const title = book.querySelector('h3 a').getAttribute('title');
            const price = book.querySelector('.price_color').textContent
            const stock = book.querySelector('.instock.availability')
            ?'In Stock'
            :'Out of Stock';
            const rating = book.querySelector('.star-rating').className.split(' ')[1]
            const link = book.querySelector('h3 a').getAttribute('href')
            const img = book.querySelector('.image_container img');
            const imgSrc = img ? img.getAttribute('src') : null;


            if (!imgSrc) {
                console.error('Image not found for book:', title);
            }


             // Construct the full image URL
             const baseUrl = 'https://books.toscrape.com/';
             const imageUrl = imgSrc ? baseUrl + imgSrc.replace('../..', '') : 'No image URL';

             

            return {
                title,
                price,
                stock,
                rating,
                link,
                imageUrl,
            };
        })
    
    });
    allbooks.push(...books);
    console.log(`Books on page ${currenPage}:`,books);
    currenPage++;
    }
  

    fs.writeFileSync('books.json', JSON.stringify(allbooks, null, 1))  // Write the data to a JSON file with 2-space indentation
    console.log('Data saved to books.json')

    await browser.close();
}

scrape();