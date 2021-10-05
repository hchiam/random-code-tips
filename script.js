class Fetcher {
  constructor() {
    this.text = "";
    this.headings = [];
    this.heading = "";
    this.details = "";
  }

  async getMarkdownFileText(url) {
    const response = await fetch(url);
    this.text = await response.text();
    return this;
  }

  getAllHeadings(text = this.text) {
    const headingRegex = /### (.+)/g;
    const matches = [...text.matchAll(headingRegex)];
    this.headings = matches.map((m) => m[1]);
    return this;
  }

  getDetails(heading) {
    this.heading = heading;
    if (!heading) {
      const randomIndex = getRandomInteger(0, this.headings.length - 1);
      this.heading = this.headings[randomIndex];
    }
    const escapedHeading = escapeSpecialRegexCharacters(this.heading);
    const detailsRegex = new RegExp(
      `(### ${escapedHeading}(.|[\r\n])+?)###?`,
      "g"
    );
    const details = [...this.text.matchAll(detailsRegex)];
    const firstMatch = 0;
    const firstCaptureGroup = 0;
    this.details = details[firstMatch][firstCaptureGroup].replace(
      new RegExp("### " + this.heading + "\n?"),
      ""
    );
    return this;
  }
}

function getRandomInteger(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function escapeSpecialRegexCharacters(string) {
  const regex = /([!@#$%^&*(){}/\\+=|._-])/g;
  return string.replace(regex, "\\$1");
}

async function fetchTipFromUrl(fetcher, url) {
  const text = await fetcher.getMarkdownFileText(url);
  fetcher.getAllHeadings().getDetails();

  console.log("Click the following to expand/collapse it:");

  console.groupCollapsed(fetcher.heading);
  console.log(fetcher.details);
  console.groupEnd();
  return { heading: fetcher.heading, details: fetcher.details };
}

function weaklySanitize(string) {
  return string
    .replaceAll("<script", "<some-script")
    .replaceAll("<SCRIPT", "<SOME-SCRIPT")
    .replaceAll("<iframe", "<some-iframe")
    .replaceAll("<IFRAME", "<SOME-IFRAME")
    .replaceAll("<math", "<some-math")
    .replaceAll("<MATH", "<SOME-MATH")
    .replaceAll("<TABLE", "<SOME-TABLE")
    .replaceAll("onerror=", "data-onerror=")
    .replaceAll("ONERROR=", "DATA-ONERROR=")
    .replaceAll("onload=", "data-onload=")
    .replaceAll("ONLOAD=", "DATA-ONLOAD=")
    .replaceAll("src=", "data-src=")
    .replaceAll("SRC=", "DATA-SRC=")
    .replaceAll("href=", "data-href=")
    .replaceAll("HREF=", "DATA-HREF=");
}

function removeBackToTopLink(string) {
  return string.replace(
    /\*?\*?\[⬆? ?back to top\]\(#table-of-contents\)\*?\*?/g,
    ""
  );
}

function getUTCFormattedDateString(date) {
  return date.toISOString().replaceAll(/[-.:]/g, "");
}

function createCalendarEvent(
  summary,
  start = "20160204T090000Z",
  end = "20160204T100000Z"
) {
  const icsString =
    "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Random Code Tips//NONSGML v1.0//EN\nBEGIN:VEVENT" +
    "\nRRULE:FREQ=WEEKLY" +
    "\nDTSTART:" +
    start +
    "\nDTEND:" +
    end +
    "\nSUMMARY:" +
    summary +
    "\nEND:VEVENT\nEND:VCALENDAR";

  window.open("data:text/calendar;charset=utf8," + escape(icsString));
}

function createDefaultEvent() {
  const now = getUTCFormattedDateString(new Date());
  createCalendarEvent("Random Code Tips", now, now);
}

(async function run() {
  const fetcher = new Fetcher();

  const url1 =
    "https://raw.githubusercontent.com/ryanmcdermott/clean-code-javascript/master/README.md";
  const url2 =
    "https://raw.githubusercontent.com/ryanmcdermott/code-review-tips/master/README.md";

  const { heading: heading1, details: details1 } = await fetchTipFromUrl(
    fetcher,
    url1
  );

  const { heading: heading2, details: details2 } = await fetchTipFromUrl(
    fetcher,
    url2
  );

  document.querySelector("#tip_heading_goes_here_1").innerText = heading1;
  document.querySelector("#tip_details_go_here_1").innerHTML = weaklySanitize(
    marked(removeBackToTopLink(details1))
  );

  document.querySelector("#tip_heading_goes_here_2").innerText = heading2;
  document.querySelector("#tip_details_go_here_2").innerHTML = weaklySanitize(
    marked(removeBackToTopLink(details2))
  );

  document
    .querySelector("#calendar")
    .addEventListener("click", createDefaultEvent);
})();
