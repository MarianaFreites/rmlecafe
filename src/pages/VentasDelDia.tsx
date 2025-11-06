import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

interface Venta {
  id: string;
  productos: { nombre: string; cantidad: number }[];
  total: number;
  fecha: string;
}

const VentasDelDia: React.FC = () => {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ventasRef = collection(db, "ventas");

    const unsubscribe = onSnapshot(ventasRef, (snapshot) => {
      const ventasData = snapshot.docs
        .map((doc) => {
          const data = doc.data() as any;
          return {
            id: doc.id,
            productos: Array.isArray(data.productos) ? data.productos : [],
            total: data.total || 0,
            fecha: data.fecha || "",
          };
        })
        .filter(
          (venta) =>
            venta.productos.length > 0 &&
            venta.total > 0 &&
            venta.fecha !== ""
        )
        // 🔽 Ordenar de más reciente a más antigua
        .sort((a, b) => {
          const [diaA, mesA, añoA] = a.fecha.split("/").map(Number);
          const [diaB, mesB, añoB] = b.fecha.split("/").map(Number);
          const fechaA = new Date(añoA, mesA - 1, diaA);
          const fechaB = new Date(añoB, mesB - 1, diaB);
          return fechaB.getTime() - fechaA.getTime();
        });

      setVentas(ventasData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Cargando ventas...</p>;

  return (
    <div
      style={{ padding: "20px", backgroundColor: "#f8efed", minHeight: "100vh" }}
    >
      <h1 style={{ color: "#d9b7ff", textAlign: "center" }}>Registro de Ventas🩷</h1>

      {ventas.length === 0 ? (
        <p style={{ textAlign: "center" }}>No hay ventas registradas.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#e2c0f1", color: "white" }}>
              <th style={{ padding: "10px" }}>Producto</th>
              <th style={{ padding: "10px" }}>Cantidad</th>
              <th style={{ padding: "10px" }}>Total</th>
              <th style={{ padding: "10px" }}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((venta) => (
              <tr key={venta.id} style={{ borderBottom: "1px solid #ccc" }}>
                <td style={{ padding: "10px" }}>
                  {venta.productos.length > 0
                    ? venta.productos.map((p, i) => <div key={i}>{p.nombre}</div>)
                    : "—"}
                </td>
                <td style={{ padding: "10px" }}>
                  {venta.productos.length > 0
                    ? venta.productos.map((p, i) => (
                        <div key={i}>{p.cantidad}</div>
                      ))
                    : "—"}
                </td>
                <td style={{ padding: "10px" }}>${venta.total}</td>
                <td style={{ padding: "10px" }}>{venta.fecha}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default VentasDelDia;
