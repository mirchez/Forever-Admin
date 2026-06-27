import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const Reports = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const today = new Date().toISOString().slice(0, 10);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState(today);

  const fetchData = async () => {
    try {
      const [o, p] = await Promise.all([
        axios.post(
          import.meta.env.VITE_BACKEND_URL + "/api/order/list",
          {},
          { headers: { token } }
        ),
        axios.get(import.meta.env.VITE_BACKEND_URL + "/api/product/list"),
      ]);
      if (o.data.success) setOrders(o.data.orders);
      if (p.data.success) setProducts(p.data.products);
    } catch (error) {
      console.log(error.message);
      toast.error("Error al cargar los datos de los informes");
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // La fuente de jsPDF no incluye el glifo ₲; en los PDF se usa "Gs."
  const money = (n) =>
    `Gs. ${Number(n || 0).toLocaleString("es-PY", {
      maximumFractionDigits: 0,
    })}`;

  const reportHeader = (doc, titulo, subtitulo) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("JUGUETERÍA CABRAL", 105, 18, { align: "center" });
    doc.setFontSize(12);
    doc.text(titulo, 105, 27, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(90);
    doc.text(subtitulo, 105, 34, { align: "center" });
    doc.text(
      `Generado: ${new Date().toLocaleString("es-PY")}`,
      105,
      39,
      { align: "center" }
    );
    doc.setTextColor(0);
  };

  // ---------- Informe de ventas ----------
  const generarInformeVentas = () => {
    const desdeTs = desde ? new Date(desde + "T00:00:00").getTime() : 0;
    const hastaTs = hasta
      ? new Date(hasta + "T23:59:59").getTime()
      : Date.now();
    const filtrados = orders
      .filter((o) => o.date >= desdeTs && o.date <= hastaTs)
      .sort((a, b) => a.date - b.date);

    if (filtrados.length === 0) {
      toast.error("No hay pedidos en el rango de fechas seleccionado");
      return;
    }

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    reportHeader(
      doc,
      "Informe de Ventas",
      `Período: ${desde || "inicio"} a ${hasta}`
    );

    const filas = filtrados.map((o) => [
      new Date(o.date).toLocaleDateString("es-PY"),
      `${o.address?.firstName || ""} ${o.address?.lastName || ""}`.trim() || "—",
      o.items?.length ?? 0,
      o.paymentMethod,
      o.payment ? "Pagado" : "Pendiente",
      money(o.amount),
    ]);

    const total = filtrados.reduce((acc, o) => acc + (o.amount || 0), 0);
    const totalPagado = filtrados
      .filter((o) => o.payment)
      .reduce((acc, o) => acc + (o.amount || 0), 0);

    autoTable(doc, {
      startY: 46,
      head: [["Fecha", "Cliente", "Ítems", "Método", "Pago", "Monto"]],
      body: filas,
      foot: [
        [
          { content: "TOTAL", colSpan: 5, styles: { halign: "right" } },
          money(total),
        ],
      ],
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [60, 60, 60] },
      footStyles: { fillColor: [230, 230, 230], textColor: 0, fontStyle: "bold" },
      columnStyles: { 5: { halign: "right" }, 2: { halign: "center" } },
    });

    const y = doc.lastAutoTable.finalY + 8;
    doc.setFontSize(10);
    doc.text(`Cantidad de pedidos: ${filtrados.length}`, 14, y);
    doc.text(`Total facturado: ${money(total)}`, 14, y + 6);
    doc.text(`Total cobrado (pagado): ${money(totalPagado)}`, 14, y + 12);

    doc.save(`informe-ventas-${hasta}.pdf`);
  };

  // ---------- Informe de stock ----------
  const generarInformeStock = () => {
    if (products.length === 0) {
      toast.error("No hay productos para listar");
      return;
    }
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    reportHeader(doc, "Informe de Stock / Inventario", "Existencias del catálogo");

    const ordenados = [...products].sort(
      (a, b) => (a.stock ?? 0) - (b.stock ?? 0)
    );
    const filas = ordenados.map((p) => [
      p.name,
      p.category,
      money(p.price),
      String(p.stock ?? 0),
      (p.stock ?? 0) === 0 ? "AGOTADO" : (p.stock ?? 0) <= 5 ? "Bajo" : "OK",
    ]);

    const totalUnidades = products.reduce((acc, p) => acc + (p.stock ?? 0), 0);
    const agotados = products.filter((p) => (p.stock ?? 0) === 0).length;

    autoTable(doc, {
      startY: 46,
      head: [["Producto", "Categoría", "Precio", "Stock", "Estado"]],
      body: filas,
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [60, 60, 60] },
      columnStyles: {
        2: { halign: "right" },
        3: { halign: "center" },
        4: { halign: "center" },
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 4) {
          const v = data.cell.raw;
          if (v === "AGOTADO") data.cell.styles.textColor = [180, 0, 0];
          else if (v === "Bajo") data.cell.styles.textColor = [120, 90, 0];
        }
      },
    });

    const y = doc.lastAutoTable.finalY + 8;
    doc.setFontSize(10);
    doc.text(`Productos en catálogo: ${products.length}`, 14, y);
    doc.text(`Unidades totales en stock: ${totalUnidades}`, 14, y + 6);
    doc.text(`Productos agotados: ${agotados}`, 14, y + 12);

    doc.save(`informe-stock-${today}.pdf`);
  };

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div>
        <h2 className="text-lg font-medium mb-1">Informes</h2>
        <p className="text-gray-400 text-sm">
          Generá informes en PDF de ventas y de stock para imprimir o archivar.
        </p>
      </div>

      {/* Informe de ventas */}
      <div className="border border-gray-300 rounded-lg p-5">
        <p className="font-medium mb-1">Informe de ventas</p>
        <p className="text-gray-400 text-sm mb-4">
          Pedidos realizados en un rango de fechas, con totales facturado y cobrado.
        </p>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <p className="text-sm mb-1">Desde</p>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <p className="text-sm mb-1">Hasta</p>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <button
            onClick={generarInformeVentas}
            className="bg-black text-white px-6 py-2 rounded hover:scale-95 transition"
          >
            Generar PDF
          </button>
        </div>
      </div>

      {/* Informe de stock */}
      <div className="border border-gray-300 rounded-lg p-5">
        <p className="font-medium mb-1">Informe de stock / inventario</p>
        <p className="text-gray-400 text-sm mb-4">
          Listado de productos con sus existencias, ordenado por stock; resalta
          los artículos bajos o agotados.
        </p>
        <button
          onClick={generarInformeStock}
          className="bg-black text-white px-6 py-2 rounded hover:scale-95 transition"
        >
          Generar PDF
        </button>
      </div>
    </div>
  );
};

export default Reports;
