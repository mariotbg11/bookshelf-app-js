document.addEventListener("DOMContentLoaded", function () {
  const inputBook = document.getElementById("inputBook");
  inputBook.addEventListener("submit", function (event) {
    event.preventDefault();
    alert("Buku berhasil ditambahkan ke rak!");
    addBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function addBook() {
  const inputBookTitle = document.getElementById("inputBookTitle").value;
  const inputAuthorName = document.getElementById("inputBookAuthor").value;
  const inputBookYear = document.getElementById("inputBookYear").value;
  const inputBookisComplete = document.getElementById(
    "inputBookIsComplete"
  ).checked;

  const generateBookId = generateBookID();
  const bookObject = generateBookObject(
    generateBookId,
    inputBookTitle,
    inputAuthorName,
    parseInt(inputBookYear),
    inputBookisComplete
  );
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBook();
}

function generateBookID() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

const books = [];
const RENDER_EVENT = "render-book";

function makeBook(bookObject) {
  const { id, title, author, year, isComplete } = bookObject;

  textTitle = document.createElement("h3");
  textTitle.innerText = title;

  textAuthor = document.createElement("p");
  textAuthor.innerText = author;

  textYear = document.createElement("p");
  textYear.innerText = year;

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.append(textTitle, textAuthor, textYear);

  const container = document.createElement("div");
  container.classList.add("book_item");
  container.append(textContainer);
  container.setAttribute("id", `book-${id}`);

  if (isComplete) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");

    undoButton.addEventListener("click", function () {
      undoBookFromCompleted(id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");

    trashButton.addEventListener("click", function () {
      removeBookFromCompleted(id);
    });

    container.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("check-button");

    checkButton.addEventListener("click", function () {
      addBookToCompleted(id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");

    trashButton.addEventListener("click", function () {
      removeBookFromCompleted(id);
    });

    container.append(checkButton, trashButton);
  }

  return container;
}

document.addEventListener(RENDER_EVENT, function () {
  const incompletedBookList = document.getElementById(
    "incompleteBookshelfList"
  );
  incompletedBookList.innerHTML = "";

  const completedBookList = document.getElementById("completeBookshelfList");
  completedBookList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isComplete) {
      incompletedBookList.append(bookElement);
    } else completedBookList.append(bookElement);
  }
});

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBook();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  alert("Buku berhasil dihapus dari rak!");
  saveBook();
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBook();
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function saveBook() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOK_APPS";

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}
