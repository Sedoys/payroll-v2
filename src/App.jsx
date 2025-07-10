import React, { useState, useEffect } from "react";

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function monthYearKey(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}`;
}

const STORAGE_KEY = "payroll_v2_data";

function App() {
  const [employees, setEmployees] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getWeekStart(new Date()));
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [newEmployeeRate, setNewEmployeeRate] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setEmployees(data.employees || []);
      setSelectedDate(new Date(data.selectedDate || Date.now()));
      setSelectedMonth(new Date(data.selectedMonth || Date.now()));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ employees, selectedDate, selectedMonth })
    );
  }, [employees, selectedDate, selectedMonth]);

  function addEmployee() {
    if (!newEmployeeName.trim() || !newEmployeeRate || isNaN(newEmployeeRate)) {
      alert("Введите корректные имя и ставку в день");
      return;
    }
    setEmployees((emps) => [
      ...emps,
      {
        id: Date.now(),
        name: newEmployeeName.trim(),
        ratePerDay: +newEmployeeRate,
        payments: {},
      },
    ]);
    setNewEmployeeName("");
    setNewEmployeeRate("");
  }
  function updatePayment(empId, weekKey, field, value) {
    setEmployees((emps) =>
      emps.map((e) => {
        if (e.id !== empId) return e;
        const payments = { ...e.payments };
        if (!payments[weekKey]) {
          payments[weekKey] = { amount: 0, bonus: 0, deduction: 0, paid: false };
        }
        payments[weekKey][field] = field === "paid" ? value : Number(value);
        return { ...e, payments };
      })
    );
  }

  const weekKey = formatDate(selectedDate);

  function changeWeek(days) {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(getWeekStart(newDate));
  }

  function changeMonth(months) {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + months);
    setSelectedMonth(newMonth);
  }

  function sumMonthPayments(emp) {
    const keyPrefix = monthYearKey(selectedMonth);
    let total = 0;
    for (const wk in emp.payments) {
      if (wk.startsWith(keyPrefix)) {
        const p = emp.payments[wk];
        total += (p.amount + p.bonus - p.deduction);
      }
    }
    return total;
  }

  function getWeekPayment(emp, wkKey) {
    const p = emp.payments[wkKey];
    if (!p) return 0;
    return p.amount + p.bonus - p.deduction;
  }
  function updatePayment(empId, weekKey, field, value) {
    setEmployees((emps) =>
      emps.map((e) => {
        if (e.id !== empId) return e;
        const payments = { ...e.payments };
        if (!payments[weekKey]) {
          payments[weekKey] = { amount: 0, bonus: 0, deduction: 0, paid: false };
        }
        payments[weekKey][field] = field === "paid" ? value : Number(value);
        return { ...e, payments };
      })
    );
  }

  const weekKey = formatDate(selectedDate);

  function changeWeek(days) {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(getWeekStart(newDate));
  }

  function changeMonth(months) {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + months);
    setSelectedMonth(newMonth);
  }

  function sumMonthPayments(emp) {
    const keyPrefix = monthYearKey(selectedMonth);
    let total = 0;
    for (const wk in emp.payments) {
      if (wk.startsWith(keyPrefix)) {
        const p = emp.payments[wk];
        total += (p.amount + p.bonus - p.deduction);
      }
    }
    return total;
  }

  function getWeekPayment(emp, wkKey) {
    const p = emp.payments[wkKey];
    if (!p) return 0;
    return p.amount + p.bonus - p.deduction;
  }
  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 20, fontFamily: "Segoe UI" }}>
      <header style={{ marginBottom: 20 }}>
        <h1>Зарплатная ведомость 2.0</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => changeWeek(-7)}>← Неделя назад</button>
          <div>Неделя с <b>{formatDate(selectedDate)}</b></div>
          <button onClick={() => changeWeek(7)}>Неделя вперёд →</button>
        </div>
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => changeMonth(-1)}>← Месяц назад</button>
          <div>Месяц: <b>{selectedMonth.toLocaleString("ru-RU", { month: "long", year: "numeric" })}</b></div>
          <button onClick={() => changeMonth(1)}>Месяц вперёд →</button>
        </div>
      </header>

      <section style={{ marginBottom: 30 }}>
        <h2>Добавить сотрудника</h2>
        <input
          type="text"
          placeholder="Имя"
          value={newEmployeeName}
          onChange={(e) => setNewEmployeeName(e.target.value)}
          style={{ padding: 8, marginRight: 10 }}
        />
        <input
          type="number"
          placeholder="Ставка в день"
          value={newEmployeeRate}
          onChange={(e) => setNewEmployeeRate(e.target.value)}
          style={{ padding: 8, marginRight: 10, width: 120 }}
        />
        <button onClick={addEmployee}>Добавить</button>
      </section>

      <section>
        <h2>Сотрудники</h2>
        {employees.length === 0 && <p>Список пуст</p>}
        {employees.map((emp) => {
          const payForWeek = getWeekPayment(emp, weekKey);
          const paid = emp.payments[weekKey]?.paid || false;
          const totalMonth = sumMonthPayments(emp);
          return (
            <div key={emp.id} style={{
              border: "1px solid #ccc",
              padding: 15,
              marginBottom: 15,
              borderRadius: 6,
              backgroundColor: paid ? "#e0ffe0" : "#fff",
            }}>
              <h3>{emp.name}</h3>
              <div>Ставка в день: <b>{emp.ratePerDay} ₽</b></div>
              <div style={{ marginTop: 10 }}>
                Зарплата за неделю:{" "}
                <input
                  type="number"
                  value={payForWeek}
                  disabled={paid}
                  onChange={(e) => {
                    const base = emp.ratePerDay * 5;
                    const entered = Number(e.target.value);
                    const diff = entered - base;
                    updatePayment(emp.id, weekKey, "amount", base);
                    updatePayment(emp.id, weekKey, "bonus", diff > 0 ? diff : 0);
                    updatePayment(emp.id, weekKey, "deduction", diff < 0 ? -diff : 0);
                  }}
                  style={{ width: 100, marginLeft: 8 }}
                />
              </div>
              <div style={{ marginTop: 10 }}>
                Премия:{" "}
                <input
                  type="number"
                  value={emp.payments[weekKey]?.bonus || 0}
                  disabled={paid}
                  onChange={(e) => updatePayment(emp.id, weekKey, "bonus", e.target.value)}
                  style={{ width: 100, marginRight: 20 }}
                />
                Удержание:{" "}
                <input
                  type="number"
                  value={emp.payments[weekKey]?.deduction || 0}
                  disabled={paid}
                  onChange={(e) => updatePayment(emp.id, weekKey, "deduction", e.target.value)}
                  style={{ width: 100 }}
                />
              </div>
              <button
                onClick={() => updatePayment(emp.id, weekKey, "paid", !paid)}
                style={{
                  marginTop: 15,
                  backgroundColor: paid ? "#4caf50" : "#f44336",
                  color: "#fff",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                {paid ? "Выплачено" : "Отметить как выплачено"}
              </button>
              <div style={{ marginTop: 15, fontWeight: "bold" }}>
                Получено за {selectedMonth.toLocaleString("ru-RU", { month: "long", year: "numeric" })}: {totalMonth} ₽
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

export default App;
