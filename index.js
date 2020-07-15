const puppeteer = require("puppeteer");
const merge = require("easy-pdf-merge");
const path = require("path");
const fs = require("fs");

const tempPath = "temp";

const buildCover = async (browser) => {
  const coverPath = `${tempPath}/cover.pdf`;
  const pageBreak = '<p style="page-break-after: always;"> </p>';
  const cover =
    `<img class="cover-image" src="https://wallpapercave.com/wp/wp5995224.jpg"/>` +
    pageBreak;
  const page = await browser.newPage();
  const options = {
    pdf: "A4",
    printBackground: true,
    path: coverPath,
  };
  await page.setDefaultNavigationTimeout(0); 
  await page.setContent(cover);
  await page.addStyleTag({
    content: `
  @page:{margin:0}
  .cover-image {
    top: 0;
    left: 0;
    position: absolute;
    width: 100%;
    height: 100%;
    background-size: cover;
  }
  `,
  });
  await page.pdf(options);
  await page.close();
  return coverPath;
};

const buildContent = async (browser) => {
  const css = path.join(__dirname + "/layout.css");
  const html = require("./content");
  const contentPath = `${tempPath}/content.pdf`;
  const options = {
    pdf: "A4",
    printBackground: true,
    path: contentPath,
    margin: { left: "2cm", top: "2cm", right: "1cm", bottom: "2.5cm" },
  };
  const page = await browser.newPage();
  await page.setContent(html);
  await page.addStyleTag({ path: css });
  await page.pdf(options);
  await page.close();
  return contentPath;
};

const main = async () => {
  const startTime = Date.now();
  const resultFileName = "result.pdf";
  !fs.existsSync(`./${tempPath}`) ? fs.mkdirSync(`./${tempPath}`) : "";
  const browser = await puppeteer.launch();
  Promise.all([buildContent(browser), buildCover(browser)])
    .then((res) => {
      merge([res[1], res[0]], resultFileName, (err) => {
        const endTime = Date.now();
        browser.close();
        console.log("time: ", endTime - startTime);
        console.log(err ? err : "done");
      });
    })
    .catch((err) => console.error(err));
};

main();
