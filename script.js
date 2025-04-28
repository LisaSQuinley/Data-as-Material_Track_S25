d3.csv("DAM_S25_Assignment-2_Track_calls-dataset - Sheet1.csv").then(function(data) {
    console.log(data); // View the loaded data in the browser console

    const margin = { top: 10, right: 10, bottom: 20, left: 10 };
    const width = window.innerWidth - margin.left - margin.right;
    const height = window.innerHeight - margin.top - margin.bottom; // Adjusted for the footer
    const imageWidth = 33; // Width for all images
    const spacing = 0; // Reduced spacing between images
    const maxHeight = height - margin.bottom - margin.top - 90; // Max height before wrapping
    const categoryCircleSize = 5; // Radius of category ellipses (smaller size)

    // Define specific colors for each category
    const categoryColors = {
        "Family": "olive",
        "Friend": "mediumslateblue",
        "Bestie": "darkmagenta",
        "Business": "palevioletred",
        "Other": "lightgrey"
    };

    // Define SVG mapping based on time unit, direction, and time category
    const svgMappings = {
        "early-sec-incoming": "svg/early-incoming-seconds.svg",
        "early-sec-outgoing": "svg/early-outgoing-seconds.svg",
        "early-min-incoming": "svg/early-incoming-minutes.svg",
        "early-min-outgoing": "svg/early-outgoing-minutes.svg",
        "morning-sec-incoming": "svg/morning-incoming-seconds.svg",
        "morning-sec-outgoing": "svg/morning-outgoing-seconds.svg",
        "morning-min-incoming": "svg/morning-incoming-minutes.svg",
        "morning-min-outgoing": "svg/morning-outgoing-minutes.svg",
        "afternoon-sec-incoming": "svg/afternoon-incoming-seconds.svg",
        "afternoon-sec-outgoing": "svg/afternoon-outgoing-seconds.svg",
        "afternoon-min-incoming": "svg/afternoon-incoming-minutes.svg",
        "afternoon-min-outgoing": "svg/afternoon-outgoing-minutes.svg",
        "evening-sec-incoming": "svg/evening-incoming-seconds.svg",
        "evening-sec-outgoing": "svg/evening-outgoing-seconds.svg",
        "evening-min-incoming": "svg/evening-incoming-minutes.svg",
        "evening-min-outgoing": "svg/evening-outgoing-minutes.svg",
    };

    
    // Append an SVG container
    const svgContainer = d3.select("#theViz")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Append the <defs> section for patterns
    const defs = svgContainer.append("defs");

    // Define image references for each day
    const imageRefs = {
        "Monday": "svg/monday.svg",
        "Tuesday": "svg/tuesday.svg",
        "Wednesday": "svg/wednesday.svg",
        "Thursday": "svg/thursday.svg",
        "Friday": "svg/friday.svg",
        "Saturday": "svg/saturday.svg",
        "Sunday": "svg/sunday.svg"
    };

    const imageSize = 60; // Size of the image element (adjust as needed)

    // Define images in the "defs" section
    Object.keys(imageRefs).forEach((day) => {
        defs.append("image")
            .attr("id", `image-${day.toLowerCase()}`)
            .attr("x", 0) // Start position for image
            .attr("y", 0) // Start position for image
            .attr("width", imageSize)
            .attr("height", imageSize)
            .attr("xlink:href", imageRefs[day]); // Set the path to the SVG file
    });

    // Initialize variables for tracking columns and images
    let totalImages = 0;  // Counter for the total number of images
    let currentX = margin.left;
    let currentY = margin.top;
    let previousDay = ""; // Track the previous day

    // Process each row in the dataset
    data.forEach((d, index) => {
        let durationText = d["Duration"];
        let durationNum = parseInt(durationText); // Extract number
        let isMinutes = durationText.includes("min");
        let date = d["Date"];
        let category = d["Category"];
        let direction = d["Direction"];
        let time = d["Time"];
        let duration = d["Duration"];
        // Get the current day from the "Day" column
        let currentDay = d["Day"];

        // Check if the day has changed (to insert the pattern separator)
        if (!previousDay || previousDay !== currentDay) {
            // Define margin for the separator
            const margin = 5;

            // Move to the next row after "Missed" or "Canceled" image set
            currentY += margin;

// Create tooltip div (hidden by default)
const dayTooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "white")
    .style("padding", "5px 10px")
    .style("border-radius", "5px")
    .style("box-shadow", "2px 2px 5px rgba(0,0,0,0.1)")
    .style("pointer-events", "none")
    .style("opacity", 0);

// Modify the part where you append day images
svgContainer.append("image")
    .attr("x", currentX + (imageWidth - imageSize) / 2) // Center with margin
    .attr("y", currentY) // Adjust y for margin before the image
    .attr("width", imageSize) // Set image width
    .attr("height", imageSize) // Set image height
    .attr("xlink:href", imageRefs[currentDay]) // Use the image file based on the day
    .on("mouseover", function (event, d) {
        dayTooltip.style("opacity", 1)
            .html(`${currentDay}`) // Show the Date from the dataset
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY + 10) + "px");
    })
    .on("mousemove", function (event) {
        dayTooltip.style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY + 10) + "px");
    })
    .on("mouseout", function () {
        dayTooltip.style("opacity", 0);
    });


            // Move down for the next data point after the image and margin
            currentY += imageSize + margin;
        }

        // Update the previousDay to the current day
        previousDay = currentDay;

        let timeCategory = getTimeCategory(d["Time"]);
        let directionType = d["Direction"];
        let timeUnit = "NA";  // Default to "NA" in case the Direction is Missed or Canceled
        let imageHeight = isMinutes ? 150 : 5;
        let rectWidth = 20; // Width for Missed and Canceled rectangles
        let rectHeight = 20; // Height for Missed and Canceled rectangles
        const timeCategoryColors = {
            "early": "gold",
            "morning": "orange",
            "afternoon": "red",
            "evening": "blue"
        };

        // Check if Direction is "Incoming", "Outgoing", "Missed", or "Canceled"
        if (directionType !== "Missed" && directionType !== "Canceled") {
            directionType = directionType === "Incoming" ? "incoming" : "outgoing";
            timeUnit = isMinutes ? "min" : "sec";
        }

        let svgPath = svgMappings[`${getTimeCategory(d["Time"])}-${timeUnit}-${directionType}`];

        if (directionType === "Missed" || directionType === "Canceled") {
            let rectColor = timeCategoryColors[timeCategory] || "gray"; // Default to gray if no match
            let rectSpacing = 5; // Define a consistent spacing value
        
            // Adjust Y position to add spacing above the rectangle
            currentY += rectSpacing;
        
            svgContainer.append("rect")
                .attr("x", currentX + (imageWidth - rectWidth) / 2) // Center horizontally
                .attr("y", currentY)
                .attr("width", rectWidth)
                .attr("height", rectHeight)
                .attr("fill", directionType === "Missed" ? rectColor : "none")  // Fill for Missed
                .attr("stroke", directionType === "Canceled" ? rectColor : "none")  // Outline for Canceled
                .attr("stroke-width", 2);

            // Update Y position with spacing below the rectangle
            currentY += rectHeight + rectSpacing;
        }

        // Increment the total image count
        totalImages += durationNum;

        let startY = currentY;
        let lastY = startY;

        for (let i = 0; i < durationNum; i++) {
            // Check if the next image exceeds max height, move to the next column
            if (lastY + imageHeight > maxHeight) {
                lastY = margin.top; // Reset to top margin
                currentX += imageWidth + spacing; // Move to next column
            }

            svgContainer.append("image")
                .attr("href", svgPath)
                .attr("x", currentX)
                .attr("y", lastY)
                .attr("width", imageWidth)
                .attr("height", imageHeight);

            lastY += imageHeight + spacing; // Move down for next image
        }

// Create tooltip div (hidden by default)
const categoryTooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "white")
    .style("padding", "5px 10px")
    .style("border-radius", "5px")
    .style("box-shadow", "2px 2px 5px rgba(0,0,0,0.1)")
    .style("font-size", "18px")
    .style("pointer-events", "none")
    .style("opacity", 0);

// Append the final category-based ellipse **below** the last SVG with reduced spacing
svgContainer.append("circle")
    .attr("cx", currentX + imageWidth / 2) // Align with SVGs
    .attr("cy", lastY + categoryCircleSize + spacing) // Reduce space between SVGs and ellipse
    .attr("r", categoryCircleSize) // Circle radius
    .attr("fill", categoryColors[d["Category"]] || "black")
    .on("mouseover", function (event, d) {
        // Get the current mouse position and window dimensions
        const mouseX = event.pageX;
        const mouseY = event.pageY;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Set tooltip content
        categoryTooltip.style("opacity", 1)
            .html(`
                <strong>Date:</strong> ${date} <br>
                <strong>Time:</strong> ${time} <br>
                <strong>Direction:</strong> ${direction} <br>
                <strong>Duration:</strong> ${duration} <br>
                <strong>Category:</strong> ${category}
            `);

        // Calculate the tooltip's position
        let tooltipX = mouseX + 10;  // Default position to the right of the mouse
        let tooltipY = mouseY + 10;  // Default position below the mouse

        // Adjust position if the tooltip goes out of bounds
        if (tooltipX + categoryTooltip.node().offsetWidth > windowWidth) {
            tooltipX = mouseX - categoryTooltip.node().offsetWidth - 10;  // Position to the left if too far right
        }

        if (tooltipY + categoryTooltip.node().offsetHeight > windowHeight) {
            tooltipY = mouseY - categoryTooltip.node().offsetHeight - 10;  // Position above if too close to bottom
        }

        // Apply the calculated position
        categoryTooltip.style("left", tooltipX + "px")
            .style("top", tooltipY + "px");
    })
    .on("mousemove", function (event) {
        // Get the current mouse position and window dimensions
        const mouseX = event.pageX;
        const mouseY = event.pageY;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Calculate the tooltip's position again on move
        let tooltipX = mouseX + 10;
        let tooltipY = mouseY + 10;

        if (tooltipX + categoryTooltip.node().offsetWidth > windowWidth) {
            tooltipX = mouseX - categoryTooltip.node().offsetWidth - 10; // To left if right-side overflow
        }

        if (tooltipY + categoryTooltip.node().offsetHeight > windowHeight) {
            tooltipY = mouseY - categoryTooltip.node().offsetHeight - 10; // To top if bottom-side overflow
        }

        categoryTooltip.style("left", tooltipX + "px")
            .style("top", tooltipY + "px");
    })
    .on("mouseout", function () {
        categoryTooltip.style("opacity", 0); // Hide tooltip on mouseout
    });


        // Update `currentY` for the next dataset row
        currentY = lastY + categoryCircleSize * 2 + spacing; // Move slightly further for spacing
    });

    // Dynamically calculate the SVG width based on total images and columns
    const svgWidth = currentX + imageWidth + spacing;

    // Update the SVG container's width based on the number of columns required
    svgContainer.attr("width", svgWidth);


});
// Create the main processBox div
const processBox = d3.select("body")
    .append("div")
    .attr("class", "process-box")
    .style("position", "fixed")
    .style("top", "50%")
    .style("left", "50%")
    .style("transform", "translate(-50%, -50%)")
    .style("background-color", "white")
    .style("border-radius", "10px")
    .style("padding", "20px")
    .style("box-shadow", "0px 4px 6px rgba(0, 0, 0, 0.1)")
    .style("width", "750px")
    .style("height", "600px")  // Fixed height
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("display", "none");

// Create a scrollable inner div inside processBox
const contentContainer = processBox.append("div")
    .attr("class", "content-container")
    .style("flex-grow", "1")  // Allows content to expand but keeps height limited
    .style("overflow-y", "auto")  // Enables scrolling
    .style("max-height", "100%")  // Prevents it from overflowing process-box

// Add header inside the contentContainer
contentContainer.append("h4")
    .html("Process Images and Explanations")  
    .style("text-align", "left")
    .style("margin", "0px");

    contentContainer.append("h5")
    .html("Hand Drawn Part 1: Front Side")  
    .style("text-align", "left")
    .style("margin", "5px 0px 0px 0px");

// Add paragraph inside contentContainer
contentContainer.append("p")
    .html("Following Giorgia Lupi's Dear Data concept, I chose to track the phone calls received or made over the course of one week and draw out a visualization using the data collected.")
    .style("text-align", "left")
    .style("font-size", "14px")
    .style("color", "gray")
    .style("margin-top", "5px")
    .style("margin-bottom", "20px");

// Add first image
contentContainer.append("img")
    .attr("src", "img/DearData-1.jpg")
    .style("width", "100%")
    .style("height", "auto")
    .style("display", "block")
    .style("margin-bottom", "15px");


contentContainer.append("h5")
    .html("Hand Drawn Part 1: Back Side")  
    .style("text-align", "left")
    .style("margin", "5px 0px 0px 0px");


// Add another paragraph (hidden initially)
contentContainer.append("p")
    .html("The back of the postcard showing the legend.")
    .style("text-align", "left")
    .style("font-size", "14px")
    .style("color", "gray")
    .style("margin-top", "5px")
    .style("margin-bottom", "20px");

// Add second image (hidden initially)
contentContainer.append("img")
    .attr("src", "img/DearData-2.jpg")
    .style("width", "100%")
    .style("height", "auto")
    .style("display", "block")
    .style("margin-bottom", "15px");

contentContainer.append("h5")
    .html("Hand Drawn Part 1: Notes")  
    .style("text-align", "left")
    .style("margin", "5px 0px 0px 0px");


contentContainer.append("p")
    .html("Initial data tracking in my notebook.")
    .style("text-align", "left")
    .style("font-size", "14px")
    .style("color", "gray")
    .style("margin-top", "5px")
    .style("margin-bottom", "20px");

contentContainer.append("img")
    .attr("src", "img/DearData-3.jpg")
    .style("width", "100%")
    .style("height", "auto")
    .style("display", "block")
    .style("margin-bottom", "15px");    


contentContainer.append("h5")
    .html("Hand Drawn Part 1: Notes (cont.)")  
    .style("text-align", "left")
    .style("margin", "5px 0px 0px 0px");

contentContainer.append("p")
    .html("First sketch ideas.")
    .style("text-align", "left")
    .style("font-size", "14px")
    .style("color", "gray")
    .style("margin-top", "5px")
    .style("margin-bottom", "20px");

contentContainer.append("img")
    .attr("src", "img/DearData-4.jpg")
    .style("width", "100%")
    .style("height", "auto")
    .style("display", "block")
    .style("margin-bottom", "0px");    


// Add the close button inside processBox (but outside contentContainer)
processBox.append("button")
    .attr("class", "close-button")
    .html("❌")
    .style("background-color", "lightgrey")
    .style("color", "white")
    .style("border", "none")
    .style("border-radius", "50%")
    .style("width", "30px")
    .style("height", "30px")
    .style("font-size", "16px")
    .style("cursor", "pointer")
    .style("align-self", "flex-end") // Aligns close button to the top right
    .on("click", function() {
        processBox.style("display", "none"); // Hide dataBox
        toggleProcessButton.html("Show Process"); 
    });


const legendData = [
    { category: "Call Direction & Type", subtitle: "Type of call activity, using the <br> 'evening' icon examples.", items: [
        { name: "Incoming Minute", minuteIcon: "svg/evening-incoming-minutes.svg" },
        { name: "Incoming Second", secondIcon: "svg/evening-incoming-seconds.svg" },
        { name: "Outgoing Minute", minuteIcon: "svg/evening-outgoing-minutes.svg" },
        { name: "Outgoing Second", secondIcon: "svg/evening-outgoing-seconds.svg" },
        { name: "Missed Call", colorbox: "blue" },
        { name: "Canceled Call", coloroutline: "blue" }
    ]},
    { category: "Time of Day", subtitle: "When the call happened, <br> icons differentiated by color.", items: [
        { name: "00:00-05:59 <br> Late Evening/Early Morning", tallRect: "gold" },
        { name: "06:00-11:59 <br> Morning", tallRect: "orange" },
        { name: "12:00-17:59 <br> Afternoon", tallRect: "red" },
        { name: "18:00-23:59 <br> Evening", tallRect: "blue" }
    ]},
    { category: "Call Category", subtitle: "Who the call was with.", items: [
        { name: "Family", circle: "olive" },
        { name: "Friend", circle: "mediumslateblue" },
        { name: "Bestie", circle: "darkmagenta" },
        { name: "Business", circle: "palevioletred" },
        { name: "Other", circle: "lightgrey"}
    ]},
    { category: "Days of the Week", subtitle: "Day of call, each hippo is <br> the start of a new day.", items: [
        { name: "Monday", hippoDay: "svg/monday.svg" },
        { name: "Tuesday", hippoDay: "svg/tuesday.svg" },
        { name: "Wednesday", hippoDay: "svg/wednesday.svg" },
        { name: "Thursday", hippoDay: "svg/thursday.svg" },
        { name: "Friday", hippoDay: "svg/friday.svg" },
        { name: "Saturday", hippoDay: "svg/saturday.svg" },
        { name: "Sunday", hippoDay: "svg/sunday.svg" }
    ]}
];

const legendBox = d3.select("body")
    .append("div")
    .attr("class", "legend-box")
    .style("display", "none");  // Make the legend box initially invisible

legendBox.append("button")
    .attr("class", "close-button")
    .html("❌")
    .style("position", "absolute")
    .style("top", "10px")
    .style("right", "10px")
    .style("background-color", "lightgrey")
    .style("color", "white")
    .style("border", "none")
    .style("border-radius", "50%")
    .style("width", "30px")
    .style("height", "30px")
    .style("font-size", "16px")
    .style("cursor", "pointer")
    .on("click", function() {
        legendBox.style("display", "none"); // Hide dataBox
        toggleLegendButton.html("Show Legend"); 
    });


// Create a row for columns
const legendRow = legendBox.append("div")
    .attr("class", "legend-row");

// Create a column for each category (single columns like "Call Direction & Type" etc.)
const columns = legendRow.selectAll(".legend-column")
    .data(legendData.filter(d => d.category !== "Time of Day" && d.category !== "Call Category")) // Only keep the individual categories
    .enter()
    .append("div")
    .attr("class", "legend-column");

// Add headers and subtitles for each column
columns.append("h4")
    .html(d => d.category)
    .style("text-align", "left")
    .style("margin", "0px"); // Reduce gap between title and subtitle

columns.append("p")
    .html(d => d.subtitle || "") // Add a subtitle if it exists
    .style("text-align", "left")
    .style("font-size", "14px")
    .style("color", "gray")
    .style("margin-top", "5px") // Space before legend items
    .style("margin-bottom", "20px"); // Space after legend items


// Create a new column that will contain both "Time of Day" and "Call Category"
const combinedColumn = legendRow.append("div")
    .attr("class", "legend-column combined-column"); // Apply the "combined-column" class

// Add the "Time of Day" section in the combined column
combinedColumn.append("h4")
    .html("Time of Day")
    .style("text-align", "left")
    .style("margin", "0px");

combinedColumn.append("p")
    .html("When the call happened, <br> icons differentiated by color.")
    .style("text-align", "left")
    .style("font-size", "14px")
    .style("color", "gray")
    .style("margin-top", "5px")
    .style("margin-bottom", "20px");

const timeOfDayItems = combinedColumn.selectAll(".legend-item-time")
    .data(legendData[1].items)  // Get the "Time of Day" items from the legendData
    .enter()
    .append("div")
    .attr("class", "legend-item")
    .style("display", "flex")
    .style("align-items", "center")
    .style("margin-bottom", "10px");

// Add time of day legend items (colored tall rects)
timeOfDayItems.each(function(d) {
    d3.select(this).append("div")
        .style("width", "10px")
        .style("height", "30px")
        .style("background-color", d.tallRect)
        .style("margin-right", "10px");
});

timeOfDayItems.append("span")
    .html(d => d.name)
    .style("font-size", "14px");


// Add the "Call Category" section in the combined column
combinedColumn.append("h4")
    .html("Call Category")
    .style("text-align", "left")
    .style("margin", "0px")
    .style("margin-top", "30px");

combinedColumn.append("p")
    .html("Who the call was with.")
    .style("text-align", "left")
    .style("font-size", "14px")
    .style("color", "gray")
    .style("margin-top", "5px")
    .style("margin-bottom", "20px");

const callCategoryItems = combinedColumn.selectAll(".legend-item-category")
    .data(legendData[2].items)  // Get the "Call Category" items from the legendData
    .enter()
    .append("div")
    .attr("class", "legend-item")
    .style("display", "flex")
    .style("align-items", "center")
    .style("margin-bottom", "5px");

// Add call category legend items (circles)
callCategoryItems.each(function(d) {
    const svg = d3.select(this).append("svg")
        .attr("width", 30)
        .attr("height", 30);

    svg.append("ellipse")
        .attr("cx", 15)
        .attr("cy", 15)
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("fill", d.circle);
});

callCategoryItems.append("span")
    .html(d => d.name)
    .style("font-size", "14px");



// Add legend items for the single columns
columns.each(function(d) {
    const column = d3.select(this);

    const legendItems = column.selectAll(".legend-item")
        .data(d.items)  // Use the correct items for the category
        .enter()
        .append("div")
        .attr("class", "legend-item")
        .style("display", "flex")
        .style("align-items", "center")
        .style("margin-bottom", "5px");

    // Add SVG icons (if available) or colored rects
    legendItems.each(function(d) {
        if (d.minuteIcon) {
            d3.select(this).append("img")
                .attr("src", d.minuteIcon)
                .attr("width", 30)
                .attr("height", 150)
                .style("margin-right", "10px");
        } else if (d.secondIcon) {
            d3.select(this).append("img")
                .attr("src", d.secondIcon)
                .attr("width", 30)
                .attr("height", 5)
                .style("margin-right", "10px");  
        } else if (d.tallRect) {
            d3.select(this).append("div")
                .style("width", "10px")
                .style("height", "30px")
                .style("background-color", d.tallRect)
                .style("margin-right", "10px");
        } else if (d.hippoDay) {
            d3.select(this).append("img")
                .attr("src", d.hippoDay)
                .attr("width", 60)
                .attr("height", 60)
                .style("margin-right", "5px");
        } else if (d.circle) {
            const svg = d3.select(this).append("svg")
                .attr("width", 30)
                .attr("height", 30);

            svg.append("ellipse")
                .attr("cx", 15)
                .attr("cy", 15)
                .attr("rx", 5)
                .attr("ry", 5)
                .attr("fill", d.circle);
        } else if (d.coloroutline) {
            d3.select(this).append("div")
                .style("width", "17.5px")
                .style("height", "17.5px")
                .style("border", `2px solid ${d.coloroutline}`) // Proper outline syntax
                .style("margin-right", "10px");
        } else if (d.colorbox) {
            d3.select(this).append("div")
                .style("width", "21px")
                .style("height", "21px")
                .style("background-color", d.colorbox)
                .style("margin-right", "10px");
        } else {
            d3.select(this).append("div")
                .style("width", "30px")
                .style("height", "30px")
                .style("background-color", d.color)
                .style("margin-right", "10px");
        }
    });

    // Add labels for each legend item
    legendItems.append("span")
        .html(d => d.name)
        .style("font-size", "14px");
});




// Function to determine time category based on the "Time" column
function getTimeCategory(timeString) {
    let hour = parseInt(timeString.split(":")[0]); // Extract hour from "HH:MM"

    if (hour >= 0 && hour < 6) return "early";  
    if (hour >= 6 && hour < 12) return "morning";  
    if (hour >= 12 && hour < 18) return "afternoon";  
    return "evening"; // Covers 18:00 - 23:59
}



// Create the main dataBox div
const dataBox = d3.select("body")
    .append("div")
    .attr("class", "data-box")
    .style("position", "fixed")
    .style("top", "50%")
    .style("left", "50%")
    .style("transform", "translate(-50%, -50%)")
    .style("background-color", "white")
    .style("border-radius", "10px")
    .style("padding", "20px")
    .style("box-shadow", "0px 4px 6px rgba(0, 0, 0, 0.1)")
    .style("width", "750px")
    .style("height", "600px")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("display", "none");

// Add a scrollable container inside dataBox
const tableContainer = dataBox.append("div")
    .attr("class", "table-container")
    .style("flex-grow", "1")  // Makes it take up available space
    .style("overflow-y", "auto")  // Enables scrolling for large tables
    .style("max-height", "100%");

// Add the close button inside dataBox
dataBox.append("button")
    .attr("class", "close-button")
    .html("❌")
    .style("background-color", "lightgrey")
    .style("color", "white")
    .style("border", "none")
    .style("border-radius", "50%")
    .style("width", "30px")
    .style("height", "30px")
    .style("font-size", "16px")
    .style("cursor", "pointer")
    .style("align-self", "flex-end") // Aligns close button to the top right
    .on("click", function() {
        dataBox.style("display", "none"); // Hide dataBox
        toggleDataButton.html("Show Data");
    });


// Load CSV and append the table inside tableContainer
d3.csv("DAM_S25_Assignment-2_Track_calls-dataset - Sheet1.csv").then(function(data) {
    var filteredColumns = data.columns.filter(column => !["Name", "App"].includes(column));

    // Create a table inside tableContainer
    var table = tableContainer.append("table")
        .style("width", "100%")
        .style("border-collapse", "collapse");

    // Create a header row
    var header = table.append("thead").append("tr");

    // Append table headers
    header.selectAll("th")
        .data(filteredColumns)
        .enter()
        .append("th")
        .text(d => d)
        .style("border", "1px solid lightgrey")
        .style("padding", "8px")
        .style("background-color", "snow");

    // Create table rows
    var rows = table.append("tbody").selectAll("tr")
        .data(data)
        .enter()
        .append("tr");

    // Append table cells
    rows.selectAll("td")
        .data(row => filteredColumns.map(column => ({ column: column, value: row[column] })))
        .enter()
        .append("td")
        .text(d => d.value)
        .style("border", "1px solid lightgrey")
        .style("padding", "8px");
});


// Create the container for the footer
const footer = d3.select("body")
    .append("div")
    .attr("class", "footer")
    .style("position", "fixed")
    .style("bottom", "20px")
    .style("left", "0px")
    .style("width", "100%") // Ensure the footer spans the full width of the page
    .style("display", "flex")
    .style("justify-content", "space-between") // Distribute space between elements
    .style("padding", "10px 40px") // Add padding to the footer
    .style("z-index", "0") // Ensure footer stays above other content
    .style("box-sizing", "border-box"); // Ensure padding is considered in the width calculation

// Left-aligned attribution text
const designer = footer
    .append("p")
    .html("Designer: Lisa Sakai Quinley")
    .style("font-size", "12px")
    .style("margin", "0") // Remove default margin for cleaner layout
    .style("flex-shrink", "0"); // Prevent shrinking of this element

// Right-aligned copyright text
const copyright = footer
    .append("p")
    .html("Data as Material | Spring 2025 | Parsons School of Design")
    .style("font-size", "12px")
    .style("margin", "0") // Remove default margin for cleaner layout
    .style("flex-shrink", "0") // Prevent shrinking
    .style("white-space", "nowrap") // Prevent wrapping of text
    .style("overflow", "hidden") // Hide overflowed content
    .style("text-overflow", "ellipsis"); // Add ellipsis for overflowed text


// Function to toggle visibility and update button text
function toggleVisibility(element, button, showText, hideText) {
    const currentDisplay = element.style("display");
    if (currentDisplay === "none") {
        element.style("display", "block");
        button.html(hideText);
    } else {
        element.style("display", "none");
        button.html(showText);
    }
}

// Create the container for the buttons
const buttonContainer = d3.select("body")
    .append("div")
    .attr("class", "button-container")
    .style("position", "fixed")
    .style("bottom", "20px")
    .style("left", "50%")
    .style("transform", "translateX(-50%)") // Center the container
    .style("display", "flex")
    .style("gap", "20px") // Space between buttons
    .style("justify-content", "center") // Evenly distribute buttons
    .style("align-items", "center");

// Function to toggle visibility and update button text
function toggleVisibility(element, button, showText, hideText) {
    const currentDisplay = element.style("display");
    element.style("display", currentDisplay === "none" ? "block" : "none");
    button.html(currentDisplay === "none" ? hideText : showText);
}

// Add buttons inside the container
const toggleLegendButton = buttonContainer.append("button")
    .attr("class", "toggle-legend-button")
    .html("Show Legend")
    .style("cursor", "pointer")
    .on("click", function() {
        toggleVisibility(legendBox, toggleLegendButton, "Show Legend", "Hide Legend");
    });

const toggleProcessButton = buttonContainer.append("button")
    .attr("class", "toggle-process-button")
    .html("Show Process")
    .style("cursor", "pointer")
    .on("click", function() {
        toggleVisibility(processBox, toggleProcessButton, "Show Process", "Hide Process");
    });

const toggleDataButton = buttonContainer.append("button")
    .attr("class", "toggle-data-button")
    .html("Show Data")
    .style("cursor", "pointer")
    .on("click", function() {
        toggleVisibility(dataBox, toggleDataButton, "Show Data", "Hide Data");
    });
