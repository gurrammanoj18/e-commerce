import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AdminWorkspaceNav from "../components/admin/AdminWorkspaceNav";
import { fetchAdminBulkInquiries, updateAdminBulkInquiry } from "../services/adminService";
import { BulkInquiry } from "../types/store";
import { formatCurrency } from "../utils/currency";
import "../styles/pages/AdminDashboardPage.css";

const AdminBulkInquiriesPage: React.FC = () => {
  const [inquiries, setInquiries] = useState<BulkInquiry[]>([]);

  const loadInquiries = async () => {
    const response = await fetchAdminBulkInquiries();
    setInquiries(response);
  };

  useEffect(() => {
    void loadInquiries();
  }, []);

  return (
    <section className="shell section page-section">
      <div className="page-header admin-page-header">
        <div>
          <span className="eyebrow">Admin workspace</span>
          <h1>Bulk inquiries and RFQs</h1>
          <p>Review quote requests, priority submissions, estimated pricing, and admin notes.</p>
        </div>
      </div>
      <AdminWorkspaceNav />

      <section className="store-card admin-panel admin-panel--full">
        <div className="admin-panel__heading">
          <div>
            <span className="eyebrow">Bulk pipeline</span>
            <h2>Submitted inquiries</h2>
          </div>
        </div>
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Status</th>
                <th>Estimate</th>
                <th>Flags</th>
                <th>Admin controls</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inquiry) => (
                <tr key={inquiry.id}>
                  <td>
                    <strong>{inquiry.companyName}</strong>
                    <div>{inquiry.contactPerson}</div>
                    <div>{inquiry.deliveryCity || "City not provided"}</div>
                  </td>
                  <td>{inquiry.quoteStatus}</td>
                  <td>{formatCurrency(inquiry.estimatedTotal || 0)}</td>
                  <td>
                    {inquiry.rfqRequired ? "RFQ" : "Standard"} /{" "}
                    {inquiry.priorityRequest ? "Priority" : "Normal"}
                  </td>
                  <td>
                    <div className="admin-summary-stack">
                      <select
                        value={inquiry.quoteStatus}
                        onChange={async (event) => {
                          await updateAdminBulkInquiry(inquiry.id, {
                            quoteStatus: event.target.value,
                            adminNotes: inquiry.adminNotes || "",
                            estimatedTotal: inquiry.estimatedTotal || 0,
                            priorityRequest: inquiry.priorityRequest,
                          });
                          toast.success("Inquiry updated");
                          await loadInquiries();
                        }}
                      >
                        {["NEW", "REVIEWING", "QUOTED", "NEGOTIATION", "WON", "LOST"].map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <textarea
                        rows={3}
                        value={inquiry.adminNotes || ""}
                        onChange={(event) =>
                          setInquiries((current) =>
                            current.map((item) =>
                              item.id === inquiry.id ? { ...item, adminNotes: event.target.value } : item,
                            ),
                          )
                        }
                      />
                      <input
                        type="number"
                        min={0}
                        value={inquiry.estimatedTotal || 0}
                        onChange={(event) =>
                          setInquiries((current) =>
                            current.map((item) =>
                              item.id === inquiry.id
                                ? { ...item, estimatedTotal: Number(event.target.value) }
                                : item,
                            ),
                          )
                        }
                      />
                      <button
                        className="button"
                        type="button"
                        onClick={async () => {
                          await updateAdminBulkInquiry(inquiry.id, {
                            quoteStatus: inquiry.quoteStatus,
                            adminNotes: inquiry.adminNotes || "",
                            estimatedTotal: inquiry.estimatedTotal || 0,
                            priorityRequest: inquiry.priorityRequest,
                          });
                          toast.success("Notes saved");
                          await loadInquiries();
                        }}
                      >
                        Save notes
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
};

export default AdminBulkInquiriesPage;
