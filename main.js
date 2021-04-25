// Modal class
const Modal = {
    open() {
        document
            .querySelector(".modal-overlay")
            .classList.add("active");
    },
    close() {
        document
            .querySelector(".modal-overlay")
            .classList.remove("active");
    }
}

// Local Storage Transactions
const Storage = {
    get() { 
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions));
    }
}

// Transaction class
const Transaction = {
    all: Storage.get()  ,
    
    add(transaction) {
        this.all.push(transaction);
        App.reload();
    },

    remove(index) {
        this.all.splice(index, 1);
        App.reload();
    },

    incomes() {
        let income = 0;
        this.all.forEach(transaction => {
            income = transaction.amount > 0 ? income + transaction.amount : income;
        });
        return income;
    },

    expenses() {
        let expense = 0;
        this.all.forEach(transaction => {
            expense = transaction.amount < 0 ? expense + transaction.amount : expense;
        });
        return expense;
    },

    total() {
        return this.incomes() + this.expenses();
    }
}

// HTML struct for table row
const DOM = {
    transactionContainer: document.querySelector("#data-table tbody"),
    
    addTransaction(transaction, index) {
        const tr = document.createElement("tr");
        tr.innerHTML = DOM.innerHTMLTransaction(transaction);
        tr.dataset.index = index;
        DOM.transactionContainer.appendChild(tr);
    },

    innerHTMLTransaction(transaction) {
        const CSSclass = transaction.amount >= 0 ? "income" : "expense";

        const amount = Utils.formatCurrency(transaction.amount); 

        const html = `
            <td class="description">${transaction.description}</td>
            <td class=${CSSclass}>${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img class="remove" src="./assets/minus.svg" alt="Remover Transação">
            </td>
        `;
        return html;
    },

    updateBalance() {
        document
            .getElementById("incomeDisplay")
            .innerHTML = Utils.formatCurrency(Transaction.incomes());
        document
            .getElementById("expenseDisplay")
            .innerHTML = Utils.formatCurrency(Transaction.expenses());
        document
            .getElementById("totalDisplay")
            .innerHTML = Utils.formatCurrency(Transaction.total());
    },

    clearTransactions(){
        this.transactionContainer.innerHTML = "";
    }
}

// Form
const Form = {
    description: document.querySelector("input#description"),
    amount: document.querySelector("input#amount"),
    date: document.querySelector("input#date"),

    getValues() {
        return {
            description: this.description.value,
            amount: this.amount.value,
            date: this.date.value
        }
    },

    validateFields() {
        const { description, amount, date } = this.getValues();

        if(
            description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === "") {
                throw new Error("Por favor, preencha todos os campos");
        }
    },

    formatData() {
        let { description, amount, date } = this.getValues();

        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);

        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        this.description.value = "";
        this.amount.value = "";
        this.date.value = "";
    },

    submit(event){
        event.preventDefault();

        try {
            Form.validateFields();
            const transaction = Form.formatData();
            Transaction.add(transaction);
            Form.clearFields();
            Modal.close();
        } catch (error) {
            alert(error.message);
        }
    }
}

// Utils
const Utils = {
    formatAmount(value) {
        value = value * 100;

        return Math.round(value);
    },

    formatDate(value) {
        const splittedDate = value.split("-")

        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value){
        const signal = Number(value) < 0 ? "-" : "";
        value = String(value).replace(/\D/g, ""); // regular expression
        value = Number(value) / 100;
        value = value.toLocaleString("pt-BR",{
            style: "currency",
            currency: "BRL"
        });
        return signal + value;
    }
}

// Buttons
const Buttons = {
    buttonNew: document.querySelector(".new"),
    buttonCancel: document.querySelector(".cancel"),
    buttonSave: document.querySelector("form"),

    new() {
        this.buttonNew.addEventListener("click", Modal.open);
    },

    cancel() {
        this.buttonCancel.addEventListener("click", Modal.close);
    },

    save() {
        this.buttonSave.addEventListener("submit", Form.submit);
    },

    remove() {
        const buttonRemove = document.querySelectorAll(".remove");
        buttonRemove.forEach((button, index) => {
            button.addEventListener("click", () => {Transaction.remove(index)});
        });
    }
}

// Application
const App = {
    init() {
        // Call render table function
        Transaction.all.forEach(DOM.addTransaction);
        // Call render Balance values
        DOM.updateBalance();

        // Buttons
        Buttons.new();
        Buttons.cancel();
        Buttons.save();
        Buttons.remove();

        // Set Local Storage
        Storage.set(Transaction.all);
    },

    reload() {
        DOM.clearTransactions();
        this.init();
    }
}

App.init();