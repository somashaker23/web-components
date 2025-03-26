class MyCalendar extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({mode: 'open'});
        const monthNum = parseInt(this.getAttribute('month')) || 1;
        const year = 2025;
        const highlightDays = this.getAttribute('highlight-days') ? this.getAttribute('highlight-days').split(',').map(Number) : [];
        const size = parseInt(this.getAttribute('size')) || 150;
        const design = this.getAttribute('design') || 'academy';
        const date = new Date(year, monthNum - 1, 1);
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        let firstDay = date.getDay();
        firstDay = firstDay === 0 ? 6 : firstDay - 1;

        const daysInMonth = new Date(year, monthNum, 0).getDate();
        const template = document.createElement('template');
        template.innerHTML = `
            <style>

                ${this.getDesignStyles(size)}
            </style>
            <table class="${design}">
                <tr><th colspan="7" class="${design} month-header">${monthNames[monthNum - 1]} ${year}</th></tr>
                <tr>${weekdays.map(day => `<th class="${design}">${day}</th>`).join('')}</tr>
                ${this.generateCalendarRows(firstDay, daysInMonth, highlightDays, design)}
            </table>
        `;
        shadow.appendChild(template.content.cloneNode(true));
    }

    getDesignStyles(size) {
        const themeColors = {
            academy: {
                '--color-bg': '#f4f4f9',
                '--color-border': '#2c3e50',
                '--color-text': '#2c3e50',
                '--color-highlight': '#e74c3c'
            },
            minimal: {
                '--color-bg': '#ffffff',
                '--color-border': '#ddd',
                '--color-text': '#333',
                '--color-highlight': '#007bff'
            },
            vibrant: {
                '--color-bg': '#fffbf0',
                '--color-border': '#ff5722',
                '--color-text': '#333',
                '--color-highlight': '#c2185b'
            },

            material: {
                '--color-bg': '#f5f5f5',
                '--color-border': '#e0e0e0',
                '--color-text': '#424242',
                '--color-highlight': '#03dac5'
            }
        };

        const colors = themeColors[this.getAttribute('design')] || themeColors.academy;

        return `
        table {
            display: inline-block;
            margin: 10px;
            border-collapse: collapse;
            width: ${size}px;
            text-align: center;
            font-family: Arial, sans-serif;
            font-size: ${size / 15}px;
            border-radius: 8px;
            background-color: ${colors['--color-bg']};
            border-color: ${colors['--color-border']};
            color: ${colors['--color-text']};
        }

        th, td {
            border: 1px solid ${colors['--color-border']};
            padding: 0;
            height: ${size / 7}px;
            width: ${size / 7}px;
            box-sizing: border-box;
     	    line-height: ${size / 7}px;           
        }

        th.month-header {
            font-size: ${size / 10}px;
            font-weight: bold;
            padding: ${size / 50}px;
            border-radius: 8px 8px 0 0;
            text-transform: uppercase;
            background-color: ${colors['--color-border']};
            color: ${colors['--color-text']};
        }

        td.highlight {
            background-color: ${colors['--color-highlight']};
            color: #fff;
            font-weight: bold;
            transition: background-color 0.3s;
        }

        td:hover {
            background-color: #eceff1;
        }
    `;
    }


    generateCalendarRows(firstDay, daysInMonth, highlightDays, design) {
        let html = '';
        let day = 1;
        const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
        for (let i = 0; i < totalCells; i++) {
            if (i % 7 === 0) html += '<tr>';
            if (i < firstDay || day > daysInMonth) {
                html += `<td class="${design}"></td>`;
            } else {
                const highlightClass = highlightDays.includes(day) ? 'highlight' : '';
                html += `<td class="${design} ${highlightClass}">${day}</td>`;
                day++;
            }
            if (i % 7 === 6) html += '</tr>';
        }
        return html;
    }
}

customElements.define('my-calendar', MyCalendar);

function renderCalendar() {
    const month = document.getElementById("month").value;
    const size = document.getElementById("size").value;
    const highlightDays = document.getElementById("highlight-days").value;
    const design = document.getElementById("design").value;

    const calendarContainer = document.getElementById("calendar-container");
    calendarContainer.innerHTML = `
            <my-calendar month="${month}" size="${size}" highlight-days="${highlightDays}" design="${design}"></my-calendar>
        `;
}
function copyToClipboard() {
    const calendarContainer = document.getElementById('calendar-container');
    const calendarElement = calendarContainer.querySelector('my-calendar');

    if (!calendarElement || !calendarElement.shadowRoot) {
        showTooltip("Please generate the calendar first!", "red");
        return;
    }

    const table = calendarElement.shadowRoot.querySelector('table');
    if (!table) {
        showTooltip("No table found to copy!", "red");
        return;
    }

    const renderedHTML = table.outerHTML;
    const styleHTML = calendarElement.shadowRoot.querySelector('style').outerHTML;
    const fullHTML = `${styleHTML}${renderedHTML}`;

    navigator.clipboard.write([
        new ClipboardItem({
            'text/html': new Blob([fullHTML], { type: 'text/html' }),
            'text/plain': new Blob([fullHTML], { type: 'text/plain' }) // Fallback for plain text
        })
    ]).then(() => {
        showTooltip("Calendar copied! Paste it into Gmail.");
    }).catch((err) => {
        showTooltip("Failed to copy! " + err.message, "red");
    });
}

function copyToClipboard1() {
    const calendarContainer = document.getElementById("calendar-container");

    if (calendarContainer.innerHTML.trim()) {
        try {
            const range = document.createRange();
            range.selectNodeContents(calendarContainer);

            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);

            document.execCommand("copy");
            selection.removeAllRanges();

            showTooltip("HTML copied to clipboard!");
        } catch (err) {
            showTooltip("Failed to copy HTML. Try again!");
        }
    } else {
        showTooltip("Please generate the calendar first!");
    }

}

function showTooltip(message, color = "green") {
    const tooltip = document.getElementById('tooltip-message');
    tooltip.innerText = message;
    tooltip.style.color = color;
    tooltip.style.visibility ='visible';

    setTimeout(() => {
        tooltip.innerText = "";
        tooltip.style.visibility ='hidden';
    }, 2000);
}





