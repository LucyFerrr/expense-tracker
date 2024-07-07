"use strict";

/*************** Selected Elements ***************/

const incomeForm = document.getElementById("income-form");
const expenseForm = document.getElementById("expense-form");
const expenseList = document.getElementById("transaction-list");
const overviewIncomes = document.getElementById("summary-income");
const overviewExpenses = document.getElementById("summary-expense");
const overviewBalance = document.getElementById("summary-balance");
const totalIncomes = document.getElementById("total-incomes");
const totalExpenses = document.getElementById("total-expenses");
const totalBalance = document.getElementById("total-balance");
const totalExpense = document.querySelector(".total-expense");
const filterCategory = document.getElementById("filter-category");
const slider = document.querySelector(".switch input");
const expenseListNew = document.getElementById("expense-table-body");
const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");

/*************** Variable Declarations ***************/

const currentDate = new Date().toISOString();
const itemsPerPage = 5;
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let incomes = JSON.parse(localStorage.getItem("incomes")) || [];
let editId = null;
let darkModeState = false;
let currentFilter = "All";
let currentPage = 1;

/*=============================================================================
// Function Name: DOMContentLoaded Event Listener
// Description: This code block executes functions after the initial HTML 
//              document has been loaded and parsed. Renders UI elements 
//              and a chart with initial data.
// Arguments: None
// Return Value: None
//---------------------------------------------------------------------------*/
document.addEventListener("DOMContentLoaded", () => {
  renderAll();
  updateTotalUI(expenses, incomes);
  updateOverviewUI(expenses, incomes);
  renderChart("yearly");
});

/*=============================================================================
// Function Name: generateId
// Description: Generates a random ID.
// Arguments: None
// Return Value: Returns the generated ID.
//---------------------------------------------------------------------------*/
function generateId() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

/*=============================================================================
// Function Name: incomeForm_onSubmitHandler
// Description: Handles the submit event for the income form.
// Arguments: event (the submit event object)
// Return Value: None
//---------------------------------------------------------------------------*/
incomeForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const amount = Number(document.getElementById("income-amount").value);
  const category = document.getElementById("income-category").value;
  const currentDate = new Date();

  if (amount && category) {
    const income = { id: generateId(), amount, category, date: currentDate };
    if (editId) {
      const index = incomes.findIndex((income) => income.id === editId);
      incomes[index] = income;
      editId = null;
    } else {
      incomes.push(income);
    }
    //localStorage (Added)
    localStorage.setItem("incomes", JSON.stringify(incomes));
    renderAll();
    renderChart(document.getElementById("interval").value);
    updateTotalUI(expenses, incomes);
    updateOverviewUI(expenses, incomes);
    incomeForm.reset();
  }
});

/*=============================================================================
// Function Name: expenseForm_onSubmitHandler
// Description: Handles the submit event for the expense form.
// Arguments: event (the submit event object)
// Return Value: None
//---------------------------------------------------------------------------*/
expenseForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const description = document.getElementById("description").value;
  const amount = Number(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const currentDate = new Date();

  if (description && amount && category) {
    const expense = {
      id: generateId(),
      description,
      amount,
      category,
      date: currentDate,
    };

    if (editId) {
      const index = expenses.findIndex((expense) => expense.id === editId);
      expenses[index] = expense;
      editId = null;
    } else {
      expenses.push(expense);
    }
    //localStorage (Added)
    localStorage.setItem("expenses", JSON.stringify(expenses));
    renderAll();
    renderChart(document.getElementById("interval").value);
    updateTotalUI(expenses, incomes);
    updateOverviewUI(expenses, incomes);
    expenseForm.reset();
  }
});

/*=============================================================================
// Function Name: filterCategory_onChangeHandler
// Description: Handles the change event for the filter category.
// Arguments: event (the submit event object)
// Return Value: None
//---------------------------------------------------------------------------*/
filterCategory.addEventListener("change", function (e) {
  e.preventDefault();
  currentFilter = filterCategory.value;
  currentPage = 1;
  renderAll();
});

/*=============================================================================
// Function Name: renderEntry
// Description: Handles the render of every entry.
// Arguments: 
//   - [I] object entry - The entry object containing information about the income/expense.
//   - [II] string type - The type of entry ("income" or "expense").
// Return Value: None
//---------------------------------------------------------------------------*/
function renderEntry(entry, type) {
  const date = new Date(entry.date);
  const formattedDate = formatDate(date);
  const icon =
    type === "income"
      ? entry.category === "Salary"
        ? "cash"
        : "trending-up"
      : entry.category === "Food"
      ? "fast-food"
      : entry.category === "Transportation"
      ? "car"
      : entry.category === "Rent"
      ? "home"
      : entry.category === "entertainment"
      ? "balloon"
      : "help-circle";

  const html = `<div class="${type}-result-container">
    <div class="category-icon-container" style="background-color:${
      darkModeState ? "#131314" : "#f3f3f3"
    }">
      <ion-icon class="category-icon" style="color:${
        darkModeState ? "#fff" : "rgba(51, 51, 51)"
      }" name="${icon}"></ion-icon>
    </div>

    <div class="${type}-container-values">
      <p class="description-${entry.id} description">${
    entry.description || entry.category
  }</p>
      <p class="amount-${entry.id} amount">₱ ${entry.amount.toFixed(2)}</p>
      <span class="category-container">
        <p class="category-${entry.id} category">${entry.category}</p>
        <p class="income-expense-type income-expense-type--${type}">${
    type.charAt(0).toUpperCase() + type.slice(1)
  }</p>
      </span>
      <p class="date-${entry.id} date">${formattedDate}</p>
    </div>

    <ul class="action-container">
      <li class="action">
        <button class="action-btns btn-edit" data-id="${
          entry.id
        }" data-type="${type}">
          <ion-icon class="btns edit-icon" name="create"></ion-icon>
        </button>
      </li>
      <li class="action">
        <button class="action-btns btn-trash" data-id="${
          entry.id
        }" data-type="${type}">
          <ion-icon class="btns trash-icon" name="close"></ion-icon>
        </button>
      </li>
    </ul>
  </div>`;

  expenseList.insertAdjacentHTML("afterbegin", html);
}

/*=============================================================================
// Function Name: onClickButtons
// Description: Handles the function of every delete and edit buttons.
// Arguments: None
// Return Value: None
//---------------------------------------------------------------------------*/
function onClickButtons() {
  const btnTrash = document.querySelectorAll(".btn-trash");
  btnTrash.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const expenseContainer = event.target.closest(
        ".expense-result-container, .income-result-container"
      );

      if (expenseContainer) {
        const id = event.currentTarget.getAttribute("data-id");
        const type = event.currentTarget.getAttribute("data-type");

        Swal.fire({
          title: "Are you sure?",
          text: "Do you want to delete this entry?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it!",
          cancelButtonText: "No, cancel",
        }).then((result) => {
          if (result.isConfirmed) {
            removeEntry(id, type);

            // Remove the container from the DOM
            expenseContainer.remove();

            // Update totals
            updateTotalUI(expenses, incomes);
            Swal.fire("Deleted!", "The entry has been deleted.", "success");
          }
        });
      }
    });
  });

  const btnEdit = document.querySelectorAll(".btn-edit");
  btnEdit.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const id = event.currentTarget.getAttribute("data-id");
      const type = event.currentTarget.getAttribute("data-type");
      editId = id;

      let entry;
      let title;
      let inputFields;

      if (type === "expense") {
        entry = expenses.find((exp) => exp.id === id);
        title = "Edit Expense";
        inputFields = `
        <div class="edit-expense-form"> 
          <label for="edit-description" class="edit-label edit-description-label">Description:</label>
          <input id="edit-description" class="edit-expense-description" placeholder="Description" value="${
            entry.description
          }">
          <label for="edit-amount" class="edit-label">Amount:</label>
          <input id="edit-amount" class="edit-expense-amount" placeholder="Amount" type="number" value="${
            entry.amount
          }">
          <label for="edit-category" class="edit-label">Category:</label>
          <select id="edit-category" class="edit-expense-category">
            <option value="Food" ${
              entry.category === "Food" ? "selected" : ""
            }>Food</option>
            <option value="Transportation" ${
              entry.category === "Transportation" ? "selected" : ""
            }>Transportation</option>
            <option value="Rent" ${
              entry.category === "Rent" ? "selected" : ""
            }>Rent</option>
            <option value="Entertainment" ${
              entry.category === "Entertainment" ? "selected" : ""
            }>Entertainment</option>
            <option value="Other" ${
              entry.category === "Other" ? "selected" : ""
            }>Other</option>
          </select>
        </div>
        `;
      } else {
        entry = incomes.find((inc) => inc.id === id);
        title = "Edit Income";
        inputFields = `
        <div class="edit-income-form"> 
        <label for="edit-amount" class="edit-label edit-description-label">Amount:</label>
        <input id="edit-amount" class="edit-income-amount" placeholder="Amount" type="number" value="${
          entry.amount
        }">
        <label for="edit-category" class="edit-label">Category:</label>
        <select id="edit-category" class="edit-income-category">
          <option value="Salary" ${
            entry.category === "Salary" ? "selected" : ""
          }>Salary</option>
          <option value="Carry Over" ${
            entry.category === "Carry Over" ? "selected" : ""
          }>Carry Over</option>
        </select>
        </div>
      `;
      }

      Swal.fire({
        title: title,
        html: inputFields,
        focusConfirm: false,
        showCancelButton: true,
        preConfirm: () => {
          if (type === "expense") {
            entry.description =
              document.getElementById("edit-description").value;
          }
          entry.amount = Number(document.getElementById("edit-amount").value);
          entry.category = document.getElementById("edit-category").value;

          return {
            id: entry.id,
            description: entry.description,
            amount: entry.amount,
            category: entry.category,
            type: type,
          };
        },
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: "Do you want to save the changes?",
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: "Save",
            denyButtonText: `Don't save`,
          }).then((saveResult) => {
            if (saveResult.isConfirmed) {
              Swal.fire("Saved!", "", "success");
              const { id, description, amount, category, type } = result.value;

              if (type === "expense") {
                const index = expenses.findIndex((exp) => exp.id === id);
                expenses[index] = {
                  id,
                  description,
                  amount,
                  category,
                  date: expenses[index].date,
                };
                localStorage.setItem("expenses", JSON.stringify(expenses));
              } else {
                const index = incomes.findIndex((inc) => inc.id === id);
                incomes[index] = {
                  id,
                  amount,
                  category,
                  date: incomes[index].date,
                };
                localStorage.setItem("incomes", JSON.stringify(incomes));
              }
              renderAll();
              updateTotalUI(expenses, incomes);
              updateOverviewUI(expenses, incomes);
            } else if (saveResult.isDenied) {
              editId = null;
              Swal.fire("Changes are not saved", "", "info");
            }
          });
        } else {
          editId = null;
        }
      });
    });
  });
}

/*=============================================================================
// Function Name: removeEntry
// Description: Handles the removal of entries.
// Arguments: None
// Return Value: None
//---------------------------------------------------------------------------*/
function removeEntry(id, type) {
  if (type === "expense") {
    expenses = expenses.filter((expense) => expense.id !== id);
    localStorage.setItem("expenses", JSON.stringify(expenses));
  } else if (type === "income") {
    incomes = incomes.filter((income) => income.id !== id);
    localStorage.setItem("incomes", JSON.stringify(incomes));
  }
  renderAll();
  updateTotalUI(expenses, incomes);
}

/*=============================================================================
// Function Name: renderAll
// Description: Renders both expenses and incomes.
// Arguments: None
// Return Value: None
//---------------------------------------------------------------------------*/
function renderAll() {
  expenseList.innerHTML = "";
  const combineEntries = [...incomes, ...expenses];
  const filteredCategory =
    currentFilter === "All"
      ? combineEntries
      : combineEntries.filter((ent) => ent.category === currentFilter);

  const sortedEntries = filteredCategory
    .sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : new Date(0);
      const dateB = b.date ? new Date(b.date) : new Date(0);
      return dateA - dateB;
    })
    .reverse();

  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageData = sortedEntries
    .slice(startIndex, startIndex + itemsPerPage)
    .reverse();

  pageData.forEach((entry) => {
    if (entry.hasOwnProperty("description")) {
      renderEntry(entry, "expense");
    } else {
      renderEntry(entry, "income");
    }
  });

  onClickButtons();
  updateButtonStates();
  renderPagination(sortedEntries.length);
}

/*=============================================================================
// Function Name: prevPageBtn_onClickHandler
// Description: Handles the previous page button click event, decreases the 
//              current page number, renders the updated entries, and updates
//              the button states.
// Arguments: None
// Return Value: None
//---------------------------------------------------------------------------*/
prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderAll();
  }
  updateButtonStates();
});

/*=============================================================================
// Function Name: nextPageBtn_onClickHandler
// Description: Handles the next page button click event, increases the 
//              current page number, renders the updated entries, and updates
//              the button states.
// Arguments: None
// Return Value: None
//---------------------------------------------------------------------------*/
nextPageBtn.addEventListener("click", () => {
  const combineEntries = [...incomes, ...expenses];
  const filteredCategory =
    currentFilter === "All"
      ? combineEntries
      : combineEntries.filter((ent) => ent.category === currentFilter);
  const totalPages = Math.ceil(filteredCategory.length / itemsPerPage);

  if (currentPage < totalPages) {
    currentPage++;
    renderAll();
  }
  updateButtonStates();
});

/*=============================================================================
// Function Name: updateButtonStates
// Description: Updates the states of the previous and next page buttons based 
//              on the current page and total pages.
// Arguments: None
// Return Value: None
//---------------------------------------------------------------------------*/
function updateButtonStates() {
  const combineEntries = [...incomes, ...expenses];
  const filteredCategory =
    currentFilter === "All"
      ? combineEntries
      : combineEntries.filter((ent) => ent.category === currentFilter);

  const totalPages = Math.ceil(filteredCategory.length / itemsPerPage);

  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;
}

/*=============================================================================
// Function Name: renderPagination
// Description: Renders the pagination buttons based on the total items and 
//              current page. Displays up to 3 page numbers at a time.
// Arguments: 
//   - [I] totalItems: number - The total number of items.
// Return Value: None
//---------------------------------------------------------------------------*/
function renderPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginationContainer = document.getElementById("pagination-numbers");
  paginationContainer.innerHTML = "";

  let startPage, endPage;
  if (totalPages <= 3) {
    startPage = 1;
    endPage = totalPages;
  } else {
    if (currentPage === 1) {
      startPage = 1;
      endPage = 3;
    } else if (currentPage === totalPages) {
      startPage = totalPages - 2;
      endPage = totalPages;
    } else {
      startPage = currentPage - 1;
      endPage = currentPage + 1;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement("button");
    pageButton.textContent = i;
    pageButton.className = i === currentPage ? "active" : "";
    pageButton.addEventListener("click", () => {
      currentPage = i;
      renderAll();
    });
    paginationContainer.appendChild(pageButton);
  }
}

/*=============================================================================
// Function Name: calculateTotal
// Description: Calculates the total income, total expenses, and balance.
// Arguments: 
//   - [I] expense: array - The array of expense objects.
//   - [II] income: array - The array of income objects.
// Return Value: object containing total income, total expenses, and balance.
//---------------------------------------------------------------------------*/
function calculateTotal(expense, income) {
  const totalIncome = income.reduce((accu, inc) => accu + inc.amount, 0);
  const totalExpense = expense.reduce((accu, exp) => accu + exp.amount, 0);
  const balance = totalIncome - totalExpense;

  return { incomeTotal: totalIncome, expenseTotal: totalExpense, balance };
}

/*=============================================================================
// Function Name: updateTotalUI
// Description: Renders the total income, expense and balance in the summary section.
// Arguments: 
//   - [I] array expenses - Contains an array of expense objects.
//   - [II] array incomes - Contains an array of income objects.
// Return Value: None
//---------------------------------------------------------------------------*/
function updateTotalUI(expense, income) {
  const totals = calculateTotal(expense, income);

  totalIncomes.textContent = `₱ ${totals.incomeTotal.toFixed(2)}`;
  totalExpenses.textContent = `₱ ${totals.expenseTotal.toFixed(2)}`;
  totalBalance.textContent = `₱ ${totals.balance.toFixed(2)}`;
}

/*=============================================================================
// Function Name: updateOverviewUI
// Description: Renders the total income, expense and balance in the overview section.
// Arguments: 
//   - [I] array expenses - Contains an array of expense objects.
//   - [II] array incomes - Contains an array of income objects.
// Return Value: None
//---------------------------------------------------------------------------*/
function updateOverviewUI(expense, income) {
  const totals = calculateTotal(expense, income);

  overviewIncomes.textContent = `₱ ${totals.incomeTotal.toFixed(2)}`;
  overviewExpenses.textContent = `₱ ${totals.expenseTotal.toFixed(2)}`;
  overviewBalance.textContent = `₱ ${totals.balance.toFixed(2)}`;
}

/*=============================================================================
// Function Name: formatDate
// Description: Formats the date according to the current locale (if possible), 
//              otherwise falling back to a basic DD/MM/YYYY format.
// Arguments: 
//   - [I] date - Contains the date of the object.
// Return Value: The formatted date string.
//---------------------------------------------------------------------------*/
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}
