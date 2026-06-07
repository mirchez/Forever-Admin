import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { currency } from "../App";
import { usePreset } from "../context/PresetContext";

const List = ({ token }) => {
  const navigate = useNavigate();
  const { preset } = usePreset();
  const [list, setList] = useState([]);
  const [showAll, setShowAll] = useState(false);

  const fetchList = async () => {
    try {
      const response = await axios.get(
        import.meta.env.VITE_BACKEND_URL + "/api/product/list"
      );
      if (response.data.success) {
        setList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/api/product/remove",
        { id },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Producto eliminado correctamente");
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const visibleList = useMemo(() => {
    if (showAll) return list;
    return list.filter((p) => preset.taxonomy.categories.includes(p.category));
  }, [list, showAll, preset.key]);

  const hiddenCount = list.length - visibleList.length;

  return (
    <>
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <p>
          Lista de productos{" "}
          <span className="text-gray-400 text-xs">
            ({visibleList.length} de {list.length})
          </span>
        </p>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}
          />
          Mostrar todos los productos
          {!showAll && hiddenCount > 0 && (
            <span className="text-gray-400">
              ({hiddenCount} oculto{hiddenCount === 1 ? "" : "s"})
            </span>
          )}
        </label>
      </div>
      <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border border-gray-300 bg-gray-100 text-sm">
        <b>Imagen</b>
        <b>Nombre</b>
        <b>Categoría</b>
        <b>Precio</b>
        <b className="text-center">Acción</b>
      </div>
      {/* -----------Product List----------- */}
      {visibleList.map((item, idx) => (
        <div
          key={idx}
          className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border border-gray-300 text-sm"
        >
          <img src={item.image} alt="product image" className="w-12" />
          <p>{item.name}</p>
          <p>{item.category}</p>
          <p>
            {currency}
            {Number(item.price).toLocaleString("es-PY")}
          </p>
          <div className="flex items-center justify-end md:justify-center gap-4">
            <p
              onClick={() => navigate(`/edit/${item._id}`)}
              className="cursor-pointer text-lg"
              title="Editar producto"
            >
              ✎
            </p>
            <p
              onClick={() => removeProduct(item._id)}
              className="cursor-pointer text-lg"
              title="Eliminar producto"
            >
              X
            </p>
          </div>
        </div>
      ))}
    </>
  );
};

export default List;
