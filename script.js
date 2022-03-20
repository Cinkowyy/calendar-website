const notes = document.querySelector('.notes');
const notePanel = document.querySelector('.note-panel');

const today = new Date();
let displayedDate;
let displayedYear;
const monthNamesGrid = document.querySelectorAll('.months .month');
const yearSpan = document.querySelector('#year');

const daysList = [
    'niedziela',
    'poniedziałek',
    'wtorek',
    'środa',
    'czwartek',
    'piątek',
    'sobota'
];

const monthsList = [
    'styczeń',
    'luty',
    'marzec',
    'kwiecień',
    'maj',
    'czerwiec',
    'lipiec',
    'sierpień',
    'wrzesień',
    'październik',
    'listopad',
    'grudzień'
];

class Day {
    constructor(date) {
        this.date = date,
        this.year = date.getFullYear(),
        this.monthNumber = date.getMonth(),
        this.month = monthsList[date.getMonth()],
        this.dayNumber = date.getDate(),
        this.dayName = daysList[date.getDay()]
    }
}

class Note {
    constructor(time, name, number) {
        this.hour = time.substring(0,2);
        this.min = time.substring(3,5);
        this.name = name,
        this.number = number
        this.sortingNumber = parseInt(this.hour+this.min, 10)
    }
}

let statusParam;

document.querySelector('#addVisit').addEventListener('click', () => {
    statusParam = 'new';
    notePanel.querySelectorAll('.inputs-wrapper input').forEach(el => {
        el.value = '';
    })
    notePanel.classList.add('active');
})

document.querySelector('#cross').addEventListener('click', cross);

function cross() {
    notePanel.classList.remove('active');

    const time = notePanel.querySelector('#timeInput');
    const name = notePanel.querySelector('#nameInput');
    const number = notePanel.querySelector('#numberInput');

    time.parentElement.style.border = 'none';
    name.style.borderColor = '#FFDF32';
    number.style.borderColor = '#FFDF32';
}

document.querySelector('#saveVisit').addEventListener('click', () => {

    const time = notePanel.querySelector('#timeInput');
    const name = notePanel.querySelector('#nameInput');
    const number = notePanel.querySelector('#numberInput');

    if(time.value == '') time.parentElement.style.border = '3px solid red';
    else time.parentElement.style.border = 'none';

    if(name.value == '') name.style.borderColor = 'red';
    else name.style.borderColor = '#FFDF32';

    if(number.value == '') number.style.borderColor = 'red';
    else number.style.borderColor = '#FFDF32';

    if(time.value != '' && name.value != '' && number.value != '') {
        saveNote(time.value, name.value, number.value);
        cross();
    }
})

function sortNotes() {
    noteArray.sort((a, b) => {
        return a.sortingNumber - b.sortingNumber;
    })
}

function saveNote(time, name, number) {

    if (statusParam == 'new') {
        let x = new Note(time, name, number);
        if(!noteArray) {
            noteArray = [];
            noteArray.push(x);
        } else {
            noteArray.push(x);
            sortNotes();
        }
    }

    if(statusParam == 'edit') {

        let y = new Note(time, name, number);
        activeNote.hour = y.hour;
        activeNote.min = y.min;
        activeNote.name = y.name;
        activeNote.number = y.number;
        activeNote.sortingNumber = y.sortingNumber;
        sortNotes();
    }

    localStorage.setItem(activeDay.toLocaleDateString(), JSON.stringify(noteArray));
    renderNotes(noteArray);
}

function generateDayObjects(date) {

    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth();

    const prevMonth = new Date(currentYear, currentMonth, 0); //poprzedni miesiąc ostatni dzień
    const lastDayPrevMonth = prevMonth.getDate(); //ostatni numerek dnia poprzedniego msca
    const prevMonthLastDayNumber = prevMonth.getDay(); // numerek dnia tygodnia ostatniego dnia poprzedniego miesiąca
    const lastDayCurrentMonth = new Date(currentYear, currentMonth+1, 0).getDate(); //ostatni numerek dnia bieżącego miesiąca

    let objectsArray = new Array(42);

    //jak działa to tego nie ruszać

    for(let i = prevMonthLastDayNumber-1; i>=0; i--) {
       objectsArray[i] = new Day(new Date(currentYear, currentMonth-1, lastDayPrevMonth-prevMonthLastDayNumber+1+i));
    }

    for(let i = 0; i<=lastDayCurrentMonth; i++) {
        objectsArray[i+prevMonthLastDayNumber] = new Day(new Date(currentYear, currentMonth, i+1));
    }

    const startingPoint = prevMonthLastDayNumber+lastDayCurrentMonth-1;

    for(let i = startingPoint ; i<42; i++) {
        objectsArray[i] = new Day(new Date(currentYear, currentMonth+1, i-startingPoint));
    }

    //dalej można ruszać

    render(objectsArray, date);
}

let daysCallbacks = [];
let notesCallbacks = [];
let displayedObject;
let activeDay;
let activeDayElement;
let noteArray;
let activeNote; //notatka która będzie aktualnie edytowana

function checkNotes(day) {
    noteArray = JSON.parse(localStorage.getItem(day.toLocaleDateString()));
    
        if(noteArray && noteArray.length>0) {
            renderNotes(noteArray);
        } else{
            notes.innerHTML = '<p class="notes-error">Brak notatek</p>';
        }
}

function render(objects, date) {

    //zmienne
    const daysGrid = document.querySelector('.days .days-grid');
    const dateInfo = document.querySelector('#day-number');
    const dayName = document.querySelector('#day-of-week');
    const monthInfo = document.querySelector('#month-name');

    //ustawianie dzisiejszego dnia po uruchomieniu
    if(date.getDate()==today.getDate() && date.getMonth()==today.getMonth() && date.getFullYear() == today.getFullYear()) {
        dateInfo.textContent = today.getDate();
        dayName.textContent = daysList[date.getDay()];
        monthInfo.textContent = monthsList[date.getMonth()]+' '+date.getFullYear();
        activeDay = today;
        notePanel.querySelector('.inputs-wrapper .date').textContent = `${today.getDate()} ${monthsList[date.getMonth()]} ${date.getFullYear()}`;

        //notki z pamięci
        checkNotes(activeDay);
    };

    //rok
    yearSpan.textContent = displayedYear = date.getFullYear();

    //podświetlanie aktywnego miesiąca
    for(let i=0; i<monthNamesGrid.length; i++) {
        monthNamesGrid[i].classList.remove('active');
        if(i==date.getMonth()) monthNamesGrid[i].classList.add('active');
    }

    //usuwanie eventListenerów dni które już nie istnieją
    for(cb of daysCallbacks) {
        cb.element.removeEventListener('click', cb.eventFn);
    }


    daysGrid.innerHTML = '';
    daysCallbacks = [];

    //generowanie dni na gridzie
    for(let i = 0; i<objects.length; i++) {
        
        //tworzenie elementu dnia
        let day = document.createElement('div');
        day.classList.add('day');
        day.textContent = objects[i].dayNumber;

        if(objects[i].monthNumber != date.getMonth()) {
            day.classList.add('not');
        }else {
            if( (objects[i].dayNumber == today.getDate()) && (objects[i].monthNumber == today.getMonth()) && (objects[i].year == today.getFullYear()) ) {
                day.classList.add('today');
                displayedObject = objects[i];
            }
        }

        //funkcja onclicka każdego dnia
        function event() {
            displayedObject = objects[i];
            dateInfo.textContent = objects[i].dayNumber;
            dayName.textContent = objects[i].dayName
            monthInfo.textContent = objects[i].month+' '+objects[i].year;
            day.classList.add('active');
            notePanel.querySelector('.inputs-wrapper .date').textContent = `${objects[i].dayNumber} ${objects[i].month} ${objects[i].year}`
            document.querySelectorAll('.inputs-wrapper input').forEach(el => {
                el.value = '';
            })

            activeDay = objects[i].date;
            activeDayElement = day;

            document.querySelectorAll('.days-grid .day').forEach( el => {
                if(el!=activeDayElement) el.classList.remove('active');
            });

            checkNotes(activeDay);      
        }

        //wpisywanie callbacków do nowych eventlistenerów aktualnych dni
        daysCallbacks.push({
            element: day,
            eventFn: event
        });

        day.addEventListener('click', event);
        daysGrid.appendChild(day);
    }

    displayedDate = date;
}

function renderNotes(arrayOfNotes) {

    notes.innerHTML = '';

    //usuwanie pozostałych listenerów
    notesCallbacks.forEach(el => {
        el.editElement.removeEventListener('click', el.editFn);
        el.deleteElement.removeEventListener('click', el.deleteFn);
    })

    notesCallbacks = []; // czyszczenie tablicy na callbacki notatek

    let i = 0;
    arrayOfNotes.forEach( el => {

        let note = document.createElement('div');
        note.classList.add('note');
        note.innerHTML = `  <div class="hour">${el.hour}:${el.min}</div>
                            <div class="name">${el.name}</div>
                            <div class="other">
                                <div class="icons">
                                    <img src="img/call.svg" alt="call">
                                </div>
                                <div class="number">${el.number}</div>
                            </div>`;

        let iconsContainer = note.querySelector('.icons')
        let editIcon = document.createElement('img');
        editIcon.setAttribute('src', 'img/edit.svg');
        editIcon.setAttribute('alty', 'edit');

        let deleteIcon = document.createElement('img')
        deleteIcon.setAttribute('src', 'img/delete.svg');
        deleteIcon.setAttribute('alt', 'delete');

        function editNote() {
            statusParam = 'edit';
            notePanel.querySelector('#timeInput').value = `${el.hour}:${el.min}`;
            notePanel.querySelector('#nameInput').value = el.name;
            notePanel.querySelector('#numberInput').value = el.number;
            activeNote = el;
            notePanel.classList.add('active');
        }

        function deleteNote() {
            el.sortingNumber = 5000;
            sortNotes();
            noteArray.pop();
            localStorage.setItem(activeDay.toLocaleDateString(), JSON.stringify(noteArray));
            checkNotes(activeDay);
        }

        notesCallbacks.push({
            editElement: editIcon,
            editFn: editNote,
            deleteElement: deleteIcon,
            deleteFn: deleteNote
        });

        editIcon.addEventListener('click', editNote);
        deleteIcon.addEventListener('click', deleteNote);

        iconsContainer.appendChild(editIcon);
        iconsContainer.appendChild(deleteIcon);

        notes.appendChild(note);
    });
}

generateDayObjects(today);

//obsługa zmiany roku
const prevYearArrow = document.querySelector('#prev-year');
const nextYearArrow = document.querySelector('#next-year');

prevYearArrow.addEventListener('click', () => {
    let value = displayedYear-1;
    yearSpan.textContent = value;
    generateDayObjects(new Date(value, displayedDate.getMonth(), 1));
})

nextYearArrow.addEventListener('click', () => {
    let value = displayedYear+1;
    yearSpan.textContent = value;
    generateDayObjects(new Date(value, displayedDate.getMonth(), 1));
})

//obsługa interaktywnych nazw miesięcy

for(let i=0; i<monthNamesGrid.length; i++) {
    monthNamesGrid[i].addEventListener('click', () => {
        const date = new Date(displayedYear, i, 1);
        if(date.getMonth() != displayedDate.getMonth())
        generateDayObjects(date);
    });
}