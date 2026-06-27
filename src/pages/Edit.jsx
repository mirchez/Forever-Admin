import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { assets } from "../assets/assets.js";
import axios from "axios";
import { toast } from "react-toastify";
import { usePreset } from "../context/PresetContext";

const Edit = ({ token }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { preset } = usePreset();
  //imágenes nuevas (File) — si quedan en false se conserva la existente
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);
  //URLs actuales del producto
  const [existingImages, setExistingImages] = useState([]);
  //datos del producto
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProduct = async () => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/api/product/single",
        { productId: id }
      );
      if (response.data.success && response.data.product) {
        const p = response.data.product;
        setName(p.name);
        setDescription(p.description);
        setPrice(p.price);
        setStock(p.stock || 0);
        setCategory(p.category);
        setSubCategory(p.subCategory);
        setBestseller(!!p.bestseller);
        setSizes(p.sizes || []);
        setExistingImages(p.image || []);
      } else {
        toast.error("Producto no encontrado");
        navigate("/list");
      }
    } catch (error) {
      console.log(error.message);
      toast.error("Error al cargar el producto");
      navigate("/list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const toggleSize = (s) => {
    setSizes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller", bestseller);
      formData.append("stock", stock);
      formData.append("sizes", JSON.stringify(sizes));

      const newImages = [image1, image2, image3, image4];
      newImages.forEach((img, idx) => {
        if (img) {
          formData.append(`image${idx + 1}`, img);
        } else if (existingImages[idx]) {
          formData.append(`existingImage${idx + 1}`, existingImages[idx]);
        }
      });

      const response = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/api/product/update",
        formData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Producto actualizado correctamente");
        navigate("/list");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error.message);
      toast.error("Ocurrió un error durante el proceso");
    }
  };

  if (loading) {
    return <p className="text-gray-500">Cargando producto...</p>;
  }

  const imageSlots = [
    [image1, setImage1, "image1", 0],
    [image2, setImage2, "image2", 1],
    [image3, setImage3, "image3", 2],
    [image4, setImage4, "image4", 3],
  ];

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col w-full items-start gap-3 md:p-0 px-2"
    >
      <div>
        <p className="mb-2">
          Imágenes <span className="text-gray-400 text-sm">(clic para reemplazar)</span>
        </p>
        <div className="flex gap-2 ">
          {imageSlots.map(([img, setImg, slotId, idx]) => (
            <label key={slotId} htmlFor={slotId}>
              <img
                src={
                  img
                    ? URL.createObjectURL(img)
                    : existingImages[idx] || assets.upload_area
                }
                alt="product image"
                className="w-20 h-20 object-cover border border-gray-300 cursor-pointer"
              />
              <input
                onChange={(e) => setImg(e.target.files[0])}
                type="file"
                id={slotId}
                hidden
              />
            </label>
          ))}
        </div>
      </div>

      <div className="w-full">
        <p className="mb-2">Nombre del producto</p>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          type="text"
          required
          className="w-full max-w-[500px] px-3 py-2"
        />
      </div>

      <div className="w-full">
        <p className="mb-2">Descripción</p>
        <textarea
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          required
          className="w-full max-w-[500px] px-3 py-2 min-h-[120px] resize-none"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8 items-center">
        <div>
          <p className="mb-2">Categoría</p>
          <select
            className="w-full px-3 py-2"
            onChange={(e) => setCategory(e.target.value)}
            value={category}
          >
            {[...new Set([category, ...preset.taxonomy.categories])]
              .filter(Boolean)
              .map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
          </select>
        </div>

        <div>
          <p className="mb-2">Subcategoría</p>
          <select
            className="w-full px-3 py-2"
            onChange={(e) => setSubCategory(e.target.value)}
            value={subCategory}
          >
            {[...new Set([subCategory, ...preset.taxonomy.subCategories])]
              .filter(Boolean)
              .map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
          </select>
        </div>

        <div>
          <p className="mb-2">Precio</p>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            type="number"
            className="w-full px-3 py-[6px] sm:w-[120px]"
            min="1"
          />
        </div>

        <div>
          <p className="mb-2">Stock</p>
          <input
            onChange={(e) => setStock(e.target.value)}
            value={stock}
            type="number"
            className="w-full px-3 py-[6px] sm:w-[120px]"
            min="0"
          />
        </div>
      </div>

      <div>
        <p className="mb-2">{preset.taxonomy.sizeLabel}</p>
        <div className="flex gap-3 flex-wrap">
          {[...new Set([...sizes, ...preset.taxonomy.sizes])].map((s) => (
            <div key={s} onClick={() => toggleSize(s)}>
              <p
                className={`${
                  sizes.includes(s) ? "bg-pink-100" : "bg-slate-200"
                } px-3 py-1 cursor-pointer`}
              >
                {s}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mt-2">
        <input
          onChange={() => setBestseller((prev) => !prev)}
          checked={bestseller}
          type="checkbox"
          id="bestseller"
        />
        <label htmlFor="bestseller" className="cursor-pointer">
          Marcar como más vendido
        </label>
      </div>

      <div className="flex gap-3 mt-4 mx-auto md:mx-0">
        <button
          type="submit"
          className="w-28 py-3 bg-black text-white hover:scale-95 hover:rounded-sm transition duration-200 ease-in"
        >
          GUARDAR
        </button>
        <button
          type="button"
          onClick={() => navigate("/list")}
          className="w-28 py-3 border border-gray-400 text-gray-600 hover:scale-95 hover:rounded-sm transition duration-200 ease-in"
        >
          CANCELAR
        </button>
      </div>
    </form>
  );
};

export default Edit;
