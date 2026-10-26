import React, { useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { useData, type ReservationStatus } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import { Trash2, Plus, X } from "lucide-react";

export const AdminReservationsPage: React.FC = () => {
  const { reservations, updateReservationStatus, addReservation, deleteReservation } = useData();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState(4);
  const [date, setDate] = useState("Today");
  const [time, setTime] = useState("7:30 PM");
  const [note, setNote] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addReservation({
      name: name.trim(),
      phone: phone.trim(),
      guests: Number(guests),
      date: date.trim(),
      time: time.trim(),
      status: "Confirmed",
      note: note.trim() || undefined,
    });
    showToast(`Reservation for ${name} confirmed.`);
    setIsModalOpen(false);
    setName("");
    setPhone("");
  };

  const getStatusBadge = (st: ReservationStatus) => {
    switch (st) {
      case "Pending":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "Confirmed":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "Completed":
        return "bg-stone-100 text-stone-700 border-stone-200";
      case "Cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
    }
  };

  return (
    <AdminLayout
      pageTitle="Table Bookings"
      pageSubtitle="Optional group seating & treat reservation log."
      actions={
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#26332A] hover:bg-[#1C241E] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-2xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Reservation</span>
        </button>
      }
    >
      <div className="bg-white rounded-2xl border border-[#E5DFD5] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] text-[#755546] uppercase font-semibold text-[10px] tracking-wider border-b border-[#EFE9DE]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">ID</th>
                <th className="py-3.5 px-4">Guest Name</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Guests</th>
                <th className="py-3.5 px-4">Date &amp; Time</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE9DE]">
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#767E7A] font-light">
                    No table reservations logged.
                  </td>
                </tr>
              ) : (
                reservations.map((r) => (
                  <tr key={r.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-[#1C241E]">
                      #{r.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#1C241E]">{r.name}</span>
                      {r.note && (
                        <p className="text-[10px] text-[#767E7A] italic mt-0.5">
                          &ldquo;{r.note}&rdquo;
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#575E5B]">{r.phone}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#1C241E]">
                      {r.guests} People
                    </td>
                    <td className="py-3.5 px-4 text-[#575E5B]">
                      {r.date} at {r.time}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                          r.status
                        )}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <select
                          value={r.status}
                          onChange={(e) => {
                            updateReservationStatus(r.id, e.target.value as ReservationStatus);
                            showToast(`Reservation #${r.id} marked as ${e.target.value}`);
                          }}
                          className="px-2 py-1 bg-[#FAF7F2] border border-[#E5DFD5] rounded-lg text-[10px] text-[#1C241E]"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => {
                            deleteReservation(r.id);
                            showToast(`Reservation #${r.id} removed.`);
                          }}
                          className="p-1 text-[#9CA3AF] hover:text-rose-600 rounded transition-colors"
                          title="Remove booking"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-[#E5DFD5] p-6 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE9DE]">
              <h3 className="font-serif text-xl font-bold text-[#1C241E]">
                Add Table Booking
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#767E7A] hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="py-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                  Guest Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priyanshu Gupta"
                  className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                    Guests
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                  Special Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Birthday celebration"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#EFE9DE]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border border-[#D5C7B5] rounded-xl text-xs text-[#575E5B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#26332A] text-white rounded-xl text-xs font-semibold uppercase tracking-wider"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
