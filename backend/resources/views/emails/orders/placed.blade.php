<h2>Order Placed Successfully</h2>

<p>Thank you for your order.</p>

<p>
    <strong>Order #{{ $order->id }}</strong>
</p>

<p>
    Total: {{ number_format($order->total, 2) }}
</p>

<p>
    We have received your order and will process it shortly.
</p>
