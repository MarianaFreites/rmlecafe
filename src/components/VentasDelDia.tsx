import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function VentasDelDia() {
  const [ventas, setVentas] = useState([]);

  useEffect(() => {
    const fetchVentas = async () => {
      const querySnapshot = await getDocs(collection(db, "ventas"));
      const data = querySnapshot.docs.map((doc) => {
        const venta = doc.data();
        return {
          id: doc.id,
          producto: venta.nombre || venta.producto || "Sin nombre",
          cantidad: venta.cantidad || 1,
          total:
            venta.total ||
            venta.precio ||
            (venta.cantidad && venta.precioUnitario
              ? venta.cantidad * venta.precioUnitario
              : 0),
        };
      });
      setVentas(data);
    };

    fetchVentas();
  }, []);

  return (
    <div className="mt-10 p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Ventas</h2>

      {ventas.length === 0 ? (
        <p className="text-gray-600">No hay ventas registradas.</p>
      ) : (
        <table className="min-w-full bg-white">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-4 text-left">Producto</th>
              <th className="py-2 px-4 text-left">Cantidad</th>
              <th className="py-2 px-4 text-left">Total</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((venta) => (
              <tr key={venta.id} className="border-b">
                <td className="py-2 px-4">{venta.producto}</td>
                <td className="py-2 px-4">{venta.cantidad}</td>
                <td className="py-2 px-4">${venta.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
