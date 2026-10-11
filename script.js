
const events = [
  {id:1,name:"AI & Machine Learning Workshop",category:"Technology",date:"2026-11-05",time:"10:00",venue:"Innovation Hub, Chennai",price:499,description:"Explore AI concepts and practical machine learning applications.",icon:"🤖"},
  {id:2,name:"Hackathon 2026",category:"Technology",date:"2026-11-14",time:"09:00",venue:"T-Hub, Hyderabad",price:299,description:"Build a prototype with your team and solve real-world problems.",icon:"💻"},
  {id:3,name:"Canva Design Masterclass",category:"Design",date:"2026-11-20",time:"14:00",venue:"Design Studio, Bengaluru",price:199,description:"Learn design, typography, layouts, and visual storytelling.",icon:"🎨"},
  {id:4,name:"Fitness Challenge",category:"Wellness",date:"2026-11-22",time:"07:00",venue:"Marina Sports Ground, Chennai",price:149,description:"Join a fun fitness session and meet a wellness community.",icon:"🏃"},
  {id:5,name:"Battle of the Bands",category:"Music",date:"2026-11-28",time:"18:30",venue:"Open Air Arena, Coimbatore",price:399,description:"Enjoy live performances by emerging music artists.",icon:"🎸"},
  {id:6,name:"Creative Futures Meetup",category:"Design",date:"2026-12-04",time:"11:00",venue:"Creative Space, Kochi",price:249,description:"Meet creative people and exchange ideas about design.",icon:"✨"}
];

let bookings = [];
let selectedEvent = null;
let pendingBooking = null;
let activeCategory = "All";
let nextEventId = 7;

const $ = id => document.getElementById(id);
const money = value => Number(value).toLocaleString("en-IN");
const safe = value => String(value ?? "").replace(/[&<>"']/g, ch =>
  ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch])
);
const dateLabel = date => date
  ? new Date(date + "T12:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})
  : "Date not specified";

function toast(message) {
  const box = $("toast");
  box.textContent = message;
  box.classList.add("show");
  clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => box.classList.remove("show"), 2500);
}

function showForm(sectionId) {
  ["bookingSection","paymentSection","confirmationSection"].forEach(id => {
    $(id).hidden = id !== sectionId;
  });
  $(sectionId).scrollIntoView({behavior:"smooth",block:"start"});
}

function renderEvents() {
  const term = $("search").value.trim().toLowerCase();
  const filtered = events.filter(e =>
    (activeCategory === "All" || e.category === activeCategory) &&
    [e.name,e.category,e.venue,e.description].join(" ").toLowerCase().includes(term)
  );

  $("eventCount").textContent = events.length;
  $("eventList").innerHTML = filtered.length ? filtered.map(e => `
    <article class="event-card">
      <div class="event-cover">${safe(e.icon)}</div>
      <div class="event-body">
        <span class="category">${safe(e.category)}</span>
        <h3>${safe(e.name)}</h3>
        <p>${safe(e.description)}</p>
        <div class="event-meta">📅 ${dateLabel(e.date)} · ${safe(e.time)}</div>
        <div class="event-meta">📍 ${safe(e.venue)}</div>
        <div class="event-bottom">
          <span class="price">${e.price === 0 ? "Free" : "₹" + money(e.price)}</span>
          <button class="primary" data-book="${e.id}" type="button">Book Now</button>
        </div>
      </div>
    </article>
  `).join("") : '<p class="empty">No events found. Try another search.</p>';
}

$("eventList").addEventListener("click", event => {
  const button = event.target.closest("[data-book]");
  if (!button) return;

  selectedEvent = events.find(e => e.id === Number(button.dataset.book));
  if (!selectedEvent) return;

  $("bookingForm").reset();
  $("tickets").value = 1;
  $("selectedEventSummary").textContent =
    `${selectedEvent.name} · ${dateLabel(selectedEvent.date)} · ${selectedEvent.venue} · ₹${money(selectedEvent.price)} per ticket`;
  updateTotal();
  showForm("bookingSection");
});

function updateTotal() {
  const count = Math.max(1, Math.min(10, Number($("tickets").value) || 1));
  $("tickets").value = count;
  $("bookingTotal").textContent = money((selectedEvent?.price || 0) * count);
}

$("tickets").addEventListener("input", updateTotal);

$("bookingForm").addEventListener("submit", event => {
  event.preventDefault();
  if (!selectedEvent || !event.currentTarget.reportValidity()) return;

  const tickets = Number($("tickets").value);
  pendingBooking = {
    id: "GT" + Date.now().toString().slice(-8),
    eventName: selectedEvent.name,
    date: selectedEvent.date,
    time: selectedEvent.time,
    venue: selectedEvent.venue,
    fullName: $("fullName").value.trim(),
    email: $("email").value.trim(),
    tickets,
    attendeeType: $("attendeeType").value,
    specialRequest: $("specialRequest").value.trim(),
    total: Number(selectedEvent.price) * tickets
  };

  $("paymentTotal").textContent = money(pendingBooking.total);
  $("paymentForm").reset();
  showForm("paymentSection");
});

$("paymentForm").addEventListener("submit", event => {
  event.preventDefault();
  if (!pendingBooking || !event.currentTarget.reportValidity()) return;

  pendingBooking.paymentMethod = $("paymentMethod").value;
  pendingBooking.paymentStatus =
    pendingBooking.paymentMethod === "Pay at Venue"
      ? "Payment due at venue"
      : "Demo payment selection only";

  bookings.push(pendingBooking);

  const b = pendingBooking;
  $("confirmationDetails").innerHTML = `
    <article class="booking-item">
      <div>
        <h3>${safe(b.eventName)}</h3>
        <p>Booking ID: ${safe(b.id)}</p>
        <p>Name: ${safe(b.fullName)}</p>
        <p>Email: ${safe(b.email)}</p>
        <p>Date: ${dateLabel(b.date)} · ${safe(b.time)}</p>
        <p>Venue: ${safe(b.venue)}</p>
        <p>Tickets: ${b.tickets} · ${safe(b.attendeeType)}</p>
        <p>Total: ₹${money(b.total)}</p>
        <p>Payment method: ${safe(b.paymentMethod)}</p>
        <p>${safe(b.paymentStatus)}</p>
        ${b.specialRequest ? `<p>Special request: ${safe(b.specialRequest)}</p>` : ""}
        <p class="success-message">
  Your booking has been confirmed successfully!
  Thank you for booking with Gatherly.
</p>
      </div>
      <span class="category">Confirmed</span>
    </article>
  `;

  pendingBooking = null;
  selectedEvent = null;
  renderBookings();
  showForm("confirmationSection");
});

function renderBookings() {
  $("bookingCount").textContent = bookings.length;

  $("bookingList").innerHTML = bookings.length ? bookings.map(b => `
    <article class="booking-item">
      <div>
        <h3>${safe(b.eventName)}</h3>
        <p>Booking ID: ${safe(b.id)}</p>
        <p>Booked by: ${safe(b.fullName)} · ${safe(b.email)}</p>
        <p>${dateLabel(b.date)} at ${safe(b.time)}</p>
        <p>Venue: ${safe(b.venue)}</p>
        <p>Tickets: ${b.tickets} · Total: ₹${money(b.total)}</p>
        <p>Payment: ${safe(b.paymentMethod)}</p>
      </div>
      <span class="category">Confirmed</span>
    </article>
  `).join("") : '<p class="empty">No bookings yet. Explore events to reserve your spot.</p>';

  $("calendarList").innerHTML = bookings.length ? bookings.map(b => `
    <article class="booking-item">
      <div><h3>${safe(b.eventName)}</h3>
      <p>📅 ${dateLabel(b.date)} at ${safe(b.time)}</p>
      <p>📍 ${safe(b.venue)}</p></div>
      <span class="category">${b.tickets} ticket(s)</span>
    </article>
  `).join("") : '<p class="empty">Your booked events will appear here.</p>';
}

$("cancelBooking").addEventListener("click", () => {
  selectedEvent = null;
  $("bookingSection").hidden = true;
  $("events").scrollIntoView({behavior:"smooth"});
});

$("cancelPayment").addEventListener("click", () => showForm("bookingSection"));

$("viewBookings").addEventListener("click", () => {
  $("bookings").scrollIntoView({behavior:"smooth"});
});

$("search").addEventListener("input", renderEvents);

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;
    document.querySelectorAll(".filter").forEach(item =>
      item.classList.toggle("active", item === button)
    );
    renderEvents();
  });
});

function renderCreatedEvents() {
  const created = events.filter(e => e.createdByUser);
  $("createdList").innerHTML = created.length ? created.map(e => `
    <article class="booking-item">
      <div><h3>${safe(e.name)}</h3>
      <p>${safe(e.category)} · ${dateLabel(e.date)} · ${safe(e.venue)}</p>
      <p>Ticket price: ₹${money(e.price)}</p></div>
      <button class="secondary" data-delete="${e.id}" type="button">Delete</button>
    </article>
  `).join("") : '<p class="empty">Events you create will appear here.</p>';
}

$("eventForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;

  const data = new FormData(form);
  const category = String(data.get("category"));
  const icons = {Technology:"💡",Design:"🎨",Music:"🎵",Wellness:"🌿"};

  events.push({
    id: nextEventId++,
    name: String(data.get("name")).trim(),
    category,
    date: String(data.get("date")),
    time: String(data.get("time")),
    venue: String(data.get("venue")).trim(),
    price: Math.max(0, Number(data.get("price")) || 0),
    description: String(data.get("description")).trim(),
    icon: icons[category],
    createdByUser: true
  });

  form.reset();
  form.elements.time.value = "10:00";
  form.elements.price.value = "0";
  renderEvents();
  renderCreatedEvents();
  toast("Your event has been published!");
  $("events").scrollIntoView({behavior:"smooth"});
});

$("createdList").addEventListener("click", event => {
  const button = event.target.closest("[data-delete]");
  if (!button) return;

  const id = Number(button.dataset.delete);
  const index = events.findIndex(e => e.id === id && e.createdByUser);
  if (index !== -1) {
    events.splice(index, 1);
    renderEvents();
    renderCreatedEvents();
    toast("Event deleted.");
  }
});

$("exportCalendar").addEventListener("click", () => {
  if (!bookings.length) {
    toast("Book an event before exporting your calendar.");
    return;
  }

  const escapeICS = value => String(value)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");

  const eventsICS = bookings.map(b => {
    const start = b.date.replace(/-/g, "") + "T" + b.time.replace(":", "") + "00";
    const startDate = new Date(`${b.date}T${b.time}:00`);
    startDate.setHours(startDate.getHours() + 2);
    const end = startDate.getFullYear() +
      String(startDate.getMonth() + 1).padStart(2, "0") +
      String(startDate.getDate()).padStart(2, "0") + "T" +
      String(startDate.getHours()).padStart(2, "0") +
      String(startDate.getMinutes()).padStart(2, "0") + "00";

    return [
      "BEGIN:VEVENT",
      `UID:${b.id}@gatherly.demo`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${escapeICS(b.eventName)}`,
      `LOCATION:${escapeICS(b.venue)}`,
      `DESCRIPTION:${escapeICS("Gatherly booking for " + b.fullName)}`,
      "END:VEVENT"
    ].join("\r\n");
  });

  const calendar = [
    "BEGIN:VCALENDAR", "VERSION:2.0",
    "PRODID:-//Gatherly//Event Calendar//EN",
    "CALSCALE:GREGORIAN", ...eventsICS, "END:VCALENDAR"
  ].join("\r\n");

  const url = URL.createObjectURL(new Blob([calendar], {type:"text/calendar;charset=utf-8"}));
  const link = document.createElement("a");
  link.href = url;
  link.download = "gatherly-bookings.ics";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  toast("Calendar file exported.");
});

const today = new Date();
today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
document.querySelectorAll('input[type="date"]').forEach(input => {
  input.min = today.toISOString().slice(0, 10);
});

renderEvents();
renderBookings();
renderCreatedEvents();
