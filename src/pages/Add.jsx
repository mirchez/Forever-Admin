import { useEffect, useState } from "react";
import { assets } from "../assets/assets.js";
import axios from "axios";
import { toast } from "react-toastify";
import { usePreset } from "../context/PresetContext";

const Add = ({ token }) => {
  const { preset } = usePreset();
  //product images
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);
  //product caracteristics
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [category, setCategory] = useState(preset.taxonomy.categories[0]);
  const [subCategory, setSubCategory] = useState(preset.taxonomy.subCategories[0]);
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);

  // When preset changes, reset selected category/subcategory/sizes to valid values
  useEffect(() => {
    setCategory(preset.taxonomy.categories[0]);
    setSubCategory(preset.taxonomy.subCategories[0]);
    setSizes([]);
  }, [preset.key]);

  const toggleSize = (s) => {
    setSizes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller", bestseller);
      formData.append("stock", stock);
      formData.append("sizes", JSON.stringify(sizes));

      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);

      const response = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/api/product/add",
        formData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Producto agregado correctamente");
        setName("");
        setDescription("");
        setPrice("");
        setStock(0);
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error.message);
      toast.error("Ocurrió un error durante el proceso");
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col w-full items-start gap-3 md:p-0 px-2"
    >
      <div>
        <p className="mb-2">Subir imagen</p>
        <div className="flex gap-2 ">
          {[
            [image1, setImage1, "image1"],
            [image2, setImage2, "image2"],
            [image3, setImage3, "image3"],
            [image4, setImage4, "image4"],
          ].map(([img, setImg, id]) => (
            <label key={id} htmlFor={id}>
              <img
                src={!img ? assets.upload_area : URL.createObjectURL(img)}
                alt="upload image"
                className="w-20"
              />
              <input
                onChange={(e) => setImg(e.target.files[0])}
                type="file"
                id={id}
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
          placeholder="Escribí aquí"
          required
          className="w-full max-w-[500px] px-3 py-2"
        />
      </div>

      <div className="w-full">
        <p className="mb-2">Descripción</p>
        <textarea
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          placeholder="Escribí el contenido aquí"
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
            {preset.taxonomy.categories.map((c) => (
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
            {preset.taxonomy.subCategories.map((s) => (
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
            placeholder="25"
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
            placeholder="0"
            className="w-full px-3 py-[6px] sm:w-[120px]"
            min="0"
          />
        </div>
      </div>

      <div>
        <p className="mb-2">{preset.taxonomy.sizeLabel}</p>
        <div className="flex gap-3 flex-wrap">
          {preset.taxonomy.sizes.map((s) => (
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

      <button
        type="submit"
        className="w-28 py-3 mt-4 bg-black text-white hover:scale-95 hover:rounded-sm transition duration-200 ease-in mx-auto md:mx-0"
      >
        AGREGAR
      </button>
    </form>
  );
};

export default Add;
