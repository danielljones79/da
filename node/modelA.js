const getParagraphsWithCorrections = (essay, corrections) => {
  const paragraphs = essay.split("\n").filter((p) => p.length > 0);

  return paragraphs.map((paragraph, index) => {
    if (!corrections[index] || Object.keys(corrections[index]).length === 0) {
      return [{ text: paragraph, isCorrection: false }];
    }

    const paragraphCorrections = corrections[index];
    const correctionRanges = Object.keys(paragraphCorrections).sort((a, b) => {
      const [startA] = a.split("-").map(Number);
      const [startB] = b.split("-").map(Number);
      return startA - startB;
    });

    let sections = [];
    let lastIndex = 0;

    correctionRanges.forEach((range) => {
      const [start, end] = range.split("-").map(Number);
      const { correctedText, comment } = paragraphCorrections[range];

      // Add the text before the current correction
      if (start > lastIndex) {
        sections.push({
          text: paragraph.slice(lastIndex, start),
          isCorrection: false,
        });
      }

      // Add the correction
      sections.push({
        text: paragraph.slice(start, end),
        isCorrection: true,
        correctedText,
        comment,
        start,
        end,
      });

      // Update lastIndex
      lastIndex = Math.max(lastIndex, end);
    });

    // Add the remaining text after the last correction
    if (lastIndex < paragraph.length) {
      sections.push({
        text: paragraph.slice(lastIndex),
        isCorrection: false,
      });
    }

    return sections;
  });
};

const getParagraphsWithCorrectionsB = (essay, corrections) => {
  const paragraphs = essay.split("\n").filter((p) => p.length > 0);

  return paragraphs.map((paragraph, index) => {
    if (!corrections[index] || Object.keys(corrections[index]).length === 0) {
      return [{ text: paragraph, isCorrection: false }];
    }

    const paragraphCorrections = corrections[index];
    let correctionRanges = Object.keys(paragraphCorrections).map((range) => {
      const [start, end] = range.split("-").map(Number);
      return { range, start, end };
    });

    // Sort the correction ranges by the starting index.
    correctionRanges.sort((a, b) => a.start - b.start);

    let lastIndex = 0;
    let sections = [];

    correctionRanges.forEach(({ range, start, end }) => {
      if (start >= lastIndex) {
        const { correctedText, comment } = paragraphCorrections[range];

        // Add text before the correction
        if (lastIndex < start) {
          sections.push({
            text: paragraph.slice(lastIndex, start),
            isCorrection: false,
          });
        }

        // Add the corrected text
        sections.push({
          text: paragraph.slice(start, end),
          isCorrection: true,
          correctedText,
          comment,
          start,
          end,
        });

        // Update the lastIndex to avoid overlapping corrections
        lastIndex = end;
      }
    });

    // Add any remaining text after the last correction.
    if (lastIndex < paragraph.length) {
      sections.push({
        text: paragraph.slice(lastIndex),
        isCorrection: false,
      });
    }

    return sections;
  });
};

const para = `
If you find yourself using the “middle” ratings much more often than not, it’s likely because you’re dealing with requests or topics where the models are very bad or very good. This leads to responses that are similarly bad or similarly good, and so you end up using the middle of the rating scale. This is expected as you get used to the capabilities of the models, but you can do something to produce more useful data.
When you’re familiar with what the models are very bad or very good at, you can find situations where they’re only sometimes good or bad. This usually leads to responses that vary in quality, which gives the models a lot more to analyze when they process the data later (days or weeks later). They know that one response is better than the other because you’ve told them which is better and by how much (slightly better, much better, etc.). When there’s a significant quality discrepancy, they can start to figure out what makes one better than the other, which is how they improve over time.
Chatbot: That’s a great question. Cheese is very important when making a lasagna! Mozzarella and Parmesan are found in most lasagna recipes, but because there are thousands of recipes for this popular dish, there are many other options available to you. Would you like me to provide other less-common options, or perhaps a recipe for lasagna that includes Mozzarella and Parmesan?
`
corrections = {
  "0" : {
    "10-20": {
      "correctedText": "1234567890"
    },
    "15-25": {
      "correctedText": "zzzzzzzzzzz"
    }
  }
}
response = getParagraphsWithCorrections(para, corrections)
console.log(response)