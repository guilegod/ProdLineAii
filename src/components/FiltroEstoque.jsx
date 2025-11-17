const [bobinas, setBobinas] = useState([]);
const [filtro, setFiltro] = useState("todas");
const [visual, setVisual] = useState("estilo1");

useEffect(() => {
  async function carregar() {
    const data = await getBobinas();
    setBobinas(data);
  }
  carregar();
}, []);
