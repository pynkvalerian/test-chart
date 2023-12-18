import * as d3 from "d3";
import { useRef, useEffect, memo } from 'react'
import data from "./data.json";

// Declare the chart dimensions and margins.
const marginTop = 20;
const marginRight = 20;
const marginBottom = 30;
const marginLeft = 40;

const Chart = () => {
	const width = window.innerWidth / 2;
	const height = window.innerHeight / 2;
	const chartRef = useRef(null);

	const earn = data.map((d) => d.earn);
	const spend = data.map((d) => d.spend);
	const earnAndSpend = [...earn, ...spend];
	const months = data.map((d) => d.month);
	const subGroups = ['earn', 'spend'];

	const maxEarnOrSpend = Math.max(...earnAndSpend);
	
	const drawChart = () => {
		if (!chartRef.current ) return
		
		// define x and y axis
		const x = d3.scaleBand()
			.domain(months)
			.range([marginLeft, width - marginRight])
			.padding(0.05);

		const y = d3.scaleLinear()
			.domain([0, Math.max(...earnAndSpend)])
			.range([height - marginBottom, marginTop]);

		// define colors for earn and spend bars
		const barColor = d3.scaleOrdinal()
			.domain(subGroups)
			.range(['#B2FCF1','#C4DCFC'])

		const barBackgroundColor = '#F6F6F6';

		const barBackgroundColorSelected = '#E2E2E2';
		const barEarnColorSelected = '#00E5C4';
		const barSpendColorSelected = '#8BB6EF';

		// define subgroups for earn and spend for each month
		const xSubgroup = d3.scaleBand()
			.domain(subGroups)
			.range([0, x.bandwidth()])
			.padding([0.2])

		// generate svg
		const svg = d3.select(chartRef.current)
			.attr("width", width)
			.attr("height", height);
		
		// generate x axis
		svg.append("g")
			.attr("transform", `translate(0,${height - marginBottom})`)
			.call(d3.axisBottom(x));

		// generate y axis
		svg.append("g")
			.attr("transform", `translate(${marginLeft},0)`)
			.call(d3.axisLeft(y));

		// generate grey background bars
		svg.append("g")
			.selectAll("g")
			// Enter in data = loop group per group
			.data(data)
			.enter()
			.append("g")
			  	.attr("transform", (d) => { return "translate(" + x(d.month) + ",0)"; })
				.attr("class", "month")
				.attr("id", (d) => d.month)
			.selectAll("rect")
			.data((d) => subGroups.map((key) => { return {key: key, value: d[key]}; }))
			.enter().append("rect")
				.attr("x", (d) => xSubgroup(d.key))
				.attr("y", (d) => y(maxEarnOrSpend))
				.attr("width", xSubgroup.bandwidth())
				.attr("height", (d) => y(1) - y(maxEarnOrSpend))
				.attr("fill", (d) => barBackgroundColor)
				.attr("class", "backgroundBar")
				.attr("rx", 16)
    			.attr("ry", 16)

		// generate earn and spend bars using rect with rounded corners
		// referenced from: https://d3-graph-gallery.com/graph/barplot_grouped_basicWide.html
		svg.append("g")
			.selectAll("g")
			// Enter in data = loop group per group
			.data(data)
			.enter()
			.append("g")
			  	.attr("transform", (d) => { return "translate(" + x(d.month) + ",0)"; })
				.attr("class", "month")
				.attr("id", (d) => d.month)
			.selectAll("rect")
			.data((d) => subGroups.map((key) => { return {key: key, value: d[key]}; }))
			.enter().append("rect")
				.attr("x", (d) => xSubgroup(d.key))
				.attr("y", (d) => y(d.value))
				.attr("width", xSubgroup.bandwidth())
				.attr("height", (d) => y(1) - y(d.value))
				.attr("fill", (d) => barColor(d.key))
				.attr("class", (d) => d.key)
				.attr("rx", 16)
    			.attr("ry", 16)

		// To cover rounded corners at bottom of bar chart
		svg.append("g")
			.selectAll("g")
			.data(data)
			.enter()
			.append("g")
				.attr("transform", (d) => { return "translate(" + x(d.month) + ",0)"; })
				.attr("class", "month")
				.attr("id", (d) => d.month)
			.selectAll("rect")
			.data((d) => subGroups.map((key) => { return {key: key, value: d[key]}; }))
			.enter().append("rect")
				.attr("x", (d) => xSubgroup(d.key))
				.attr("y", (d) => y(d.value - 30))
				.attr("width", xSubgroup.bandwidth())
				.attr("height", (d) => y(1) - y(d.value - 30) )
				.attr("fill", (d) => barColor(d.key))
				.attr("class", (d) => d.key);


		/**
		 * TODO: listen to click events on bars
		 * 
		 * Current SVG structure: 
		 * <g class="month" id="<actual month name>">
		 * 		<rect class="backgroundBar">	
		 * 		<rect class="backgroundBar">	
		 * </g>
		 * <g class="month" id="<actual month name>">
		 * 		<rect class="earn">	
		 * 		<rect class="spend">	
		 * </g>
		 */
		d3.selectAll(".month rect").on("click", (event) => {
			const month = event.target.parentElement.id;
			const selectedMonth = d3.select(`#${month}`);

			// this does not work yet
			selectedMonth.select(".earn").attr("fill", barEarnColorSelected);
			selectedMonth.select(".spend").attr("fill", barSpendColorSelected);
		})

	}

	useEffect(() => {
		drawChart()
	}, []);

	return <svg ref={chartRef} />
}

export default Chart;

const _Chart = memo(Chart)
export { _Chart as Chart }