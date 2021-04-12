function updateFocusRangeValues(value, subround)
{
	if (subround == "s")
	{
		document.getElementById("sellFocusRangeValue").textContent = value;
		totalFocus = Number(document.getElementById("sellFocusRangeValue").textContent) + Number(document.getElementById("actFocusRangeValue").textContent) + Number(document.getElementById("buyFocusRangeValue").textContent);
		if (totalFocus > 10)
		{
			overusedFocus = totalFocus - 10;
			for (var i = 0; i < overusedFocus; i++)
			{
				if ((i % 2 == 0) && (document.getElementById("actFocus").value > 0))
				{
					document.getElementById("actFocusRangeValue").textContent = Number(document.getElementById("actFocusRangeValue").textContent) - 1;
					document.getElementById("actFocus").value = Number(document.getElementById("actFocusRangeValue").textContent);
				}
				else
				{
					if (document.getElementById("buyFocus").value > 0)
					{
						document.getElementById("buyFocusRangeValue").textContent = Number(document.getElementById("buyFocusRangeValue").textContent) - 1;
						document.getElementById("buyFocus").value = Number(document.getElementById("buyFocusRangeValue").textContent);
					}
					else
					{
						document.getElementById("actFocusRangeValue").textContent = Number(document.getElementById("actFocusRangeValue").textContent) - 1;
						document.getElementById("actFocus").value = Number(document.getElementById("actFocusRangeValue").textContent);
					}
				}
			}
		}
	}
	else if (subround == "a")
	{
		document.getElementById("actFocusRangeValue").textContent = value;
		totalFocus = Number(document.getElementById("sellFocusRangeValue").textContent) + Number(document.getElementById("actFocusRangeValue").textContent) + Number(document.getElementById("buyFocusRangeValue").textContent);
		if (totalFocus > 10)
		{
			overusedFocus = totalFocus - 10;
			for (var i = 0; i < overusedFocus; i++)
			{
				if ((i % 2 == 0) && (document.getElementById("sellFocus").value > 0))
				{
					document.getElementById("sellFocusRangeValue").textContent = Number(document.getElementById("sellFocusRangeValue").textContent) - 1;
					document.getElementById("sellFocus").value = Number(document.getElementById("sellFocusRangeValue").textContent);
				}
				else
				{
					if (document.getElementById("buyFocus").value > 0)
					{
						document.getElementById("buyFocusRangeValue").textContent = Number(document.getElementById("buyFocusRangeValue").textContent) - 1;
						document.getElementById("buyFocus").value = Number(document.getElementById("buyFocusRangeValue").textContent);
					}
					else
					{
						document.getElementById("sellFocusRangeValue").textContent = Number(document.getElementById("sellFocusRangeValue").textContent) - 1;
						document.getElementById("sellFocus").value = Number(document.getElementById("sellFocusRangeValue").textContent);
					}
				}
			}
		}
	}
	else if (subround == "b")
	{
		document.getElementById("buyFocusRangeValue").textContent = value;
		totalFocus = Number(document.getElementById("sellFocusRangeValue").textContent) + Number(document.getElementById("actFocusRangeValue").textContent) + Number(document.getElementById("buyFocusRangeValue").textContent);
		if (totalFocus > 10)
		{
			overusedFocus = totalFocus - 10;
			for (var i = 0; i < overusedFocus; i++)
			{
				if ((i % 2 == 0) && (document.getElementById("actFocus").value > 0))
				{
					document.getElementById("actFocusRangeValue").textContent = Number(document.getElementById("actFocusRangeValue").textContent) - 1;
					document.getElementById("actFocus").value = Number(document.getElementById("actFocusRangeValue").textContent);
				}
				else
				{
					if (document.getElementById("sellFocus").value > 0)
					{
						document.getElementById("sellFocusRangeValue").textContent = Number(document.getElementById("sellFocusRangeValue").textContent) - 1;
						document.getElementById("sellFocus").value = Number(document.getElementById("sellFocusRangeValue").textContent);
					}
					else
					{
						document.getElementById("actFocusRangeValue").textContent = Number(document.getElementById("actFocusRangeValue").textContent) - 1;
						document.getElementById("actFocus").value = Number(document.getElementById("actFocusRangeValue").textContent);
					}
				}
			}
		}
	}
}